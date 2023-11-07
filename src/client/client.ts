import { HEADER_LEN, REGIONS, SYNC_PERIOD, TZ_MSEC } from '../model/constant'
import { EEWInfo, EqkInfo, type EarthquakeInfo, type Station } from '../model/eqk_model'
import { HTTPError } from '../utils/error'
import * as HTTP from './http'
import { type PEWS } from './pews'
import { type LocationInfo, type Phase } from '../types/pews'
import { Logger } from '../utils/logger'

export class PEWSClient {
  private readonly delay = 1000
  protected readonly Wrapper: PEWS

  public readonly logger: Logger = new Logger()

  protected HEADER_LEN = HEADER_LEN

  private _phase: Phase = 1
  private _cachedPhase: Phase = 1

  private staList: Station[] = []
  private tide: number = this.delay
  private needSync = true
  private timeSyncIntervalID?: NodeJS.Timeout

  // flag to stop loop
  protected stopLoop = false

  // Earthqukae info
  private eqkInfo?: EarthquakeInfo
  private readonly cachedEqkInfo?: EarthquakeInfo

  constructor (wrapper: PEWS) {
    this.Wrapper = wrapper
    this.tide = this.delay
  }

  get phase (): Phase {
    return this._phase
  }

  private escape (arr: number[]): string {
    // write function that does exactly same job as escape() in ECMAScript 262
    let res = ''

    for (const x of arr) {
      const c = String.fromCharCode(x)

      if (c.match(/[A-Za-z0-9@*_+\-./]/) != null) {
        res += c
        continue
      }

      if (x < 256) {
        res += '%' + x.toString(16).padStart(2, '0')
      } else {
        res += '%u' + x.toString(16).padStart(4, '0')
      }
    }

    return res
  }

  private startTimeSyncInterval (): void {
    this.timeSyncIntervalID = setInterval(() => {
      this.needSync = true
    }, SYNC_PERIOD * 1000)
  }

  protected getTimeString (): string {
    const pad2 = (n: number): string => {
      return n < 10 ? `0${n}` : `${n}`
    }

    const date = new Date(new Date().getTime() - this.tide - TZ_MSEC)
    return `${date.getFullYear()}${pad2(date.getMonth() + 1)}${pad2(date.getDate())}${pad2(date.getHours())}${pad2(date.getMinutes())}${pad2(date.getSeconds())}`
  }

  private async syncTime (): Promise<void> {
    const res = await HTTP.get('pews2.html')

    const header = res.headers
    const st = Number(header.st)

    const dt = new Date().getTime()

    this.tide = dt - st * 1000 + this.delay
    this.needSync = false
  }

  private async callback (data: Uint8Array): Promise<void> {
    const mmiObj = await this.mmiBinStrHandler(data)

    for (let i = 0; i < this.staList.length; i++) {
      this.staList[i].mmi = mmiObj[i]
    }
  }

  protected async getSta (url?: string): Promise<void> {
    const res = await HTTP.getSta(url ?? this.getTimeString())
    const byteArray = res.data

    await this.staBinHandler(byteArray)
  }

  private async staBinHandler (byteArray: Uint8Array): Promise<void> {
    const newStaList: Station[] = []
    const staLatArr: number[] = []
    const staLonArr: number[] = []

    const temp: number[] = []

    for (const i of byteArray) {
      const x = i >> 4
      const y = i & 0b1111
      temp.push(x, y)
    }

    for (let i = 0; i < temp.length; i += 5) {
      let x = 0
      for (let j = 0; j < 5; j++) {
        x |= temp[i + j]
        x <<= 4
      }
      x >>= 4

      staLatArr.push((30 + (x >> 10) / 100))
      staLonArr.push((120 + (x & 0b1111111111) / 100))
    }

    for (let i = 0; i < staLatArr.length; i++) {
      const station: Station = { idx: i, lat: staLatArr[i], lon: staLonArr[i], mmi: -1 }
      newStaList.push(station)
    }

    if (newStaList.length > 99) {
      this.staList = newStaList
    }
  }

  protected async getMMI (url?: string): Promise<any> {
    let res
    url = url ?? this.getTimeString()

    try {
      res = await HTTP.getMMI(url)
      this.logger.debug(`getMMI: ${url}`)
    } catch (err) {
      if (err instanceof HTTPError) {
        this.logger.warn(`getMMI: failed to get MMI data (${err.status} ${err.message}) `)
        return
      }

      throw err
    }

    const byteArray = res.data

    const staF = (byteArray[0] >> 7) === 1
    const phaseHeader = byteArray[0] << 1 >> 6

    const binDataBits = byteArray.slice(this.HEADER_LEN, byteArray.length)

    switch (phaseHeader) {
      case 0:
        this._phase = 1
        break
      case 1:
        this._phase = 4
        break
      case 2:
        this._phase = 2
        break
      case 3:
        this._phase = 3
        break
    }

    if (staF || this.staList.length < 99) {
      await this.getSta()
    } else {
      await this.callback(binDataBits)
    }

    const bitEqkData = binDataBits.slice(-75)

    switch (this.phase) {
      case 2:
      case 3:
        await this.eqkHandler(bitEqkData)
        break
      case 4:
        if (this.eqkInfo != null) {
          this.eqkInfo.eqkID =
            (
              (bitEqkData[8] & 0b111) << 23 |
              (bitEqkData[9] << 15) |
              (bitEqkData[10] << 7) |
              (bitEqkData[11] >> 1)
            ) + 2000000000
        }
        break
    }
  }

  private async getLocation (eqkID: number, phase: 2 | 3): Promise<LocationInfo> {
    this.logger.debug(`getLocation: ${eqkID}`)
    return (await HTTP.getLoc(eqkID, phase)).data
  }

  private async eqkHandler (eqkData: Uint8Array): Promise<void> {
    // bit 0~9: latitude
    const lat = 30 + ((eqkData[0] << 2) | (eqkData[1] >> 6)) / 100

    // bit 10~19: longitude
    const lon = 124 + ((eqkData[1] & 0b111111) << 4 |
                       (eqkData[2] >> 4)) / 100

    // bit 20~26: magnitude
    const mag = (((eqkData[2] & 0b1111) << 3) |
                  (eqkData[3] >> 5)) / 10

    // bit 27~36: depth
    const dep = (((eqkData[3] & 0b11111) << 5) |
                  (eqkData[4] >> 3)) / 10

    // bit 37~68: time
    const time = (
      ((eqkData[4] & 0b111) << 29) |
      (eqkData[5] << 21) |
      (eqkData[6] << 13) |
      (eqkData[7] << 5) |
      (eqkData[8] >> 3)
    ) * 1000

    // bit 69~94: eqkID
    const eqkID = ((eqkData[8] & 0b111) << 23 |
                  (eqkData[9] << 15) |
                  (eqkData[10] << 7) |
                  (eqkData[11] >> 1)) +
                  2000000000

    // bit 95~98: max intensity
    const maxIntensity = (eqkData[11] & 0b1) << 3 | eqkData[12] >> 5

    // bit 99~116: max intensity area
    const maxIntensityAreaBits = (eqkData[12] & 0b11111) << 13 |
                                  eqkData[13] << 5 |
                                  eqkData[14] >> 3
    const maxIntensityArea = []

    if (maxIntensityAreaBits !== 0x1FFFF) {
      for (let i = 0; i < 17; i++) {
        if ((maxIntensityAreaBits & (1 << (17 - i))) !== 0) {
          maxIntensityArea.push(REGIONS[i])
        }
      }
    }

    let location = ''
    let isOffshore = false

    if (this.phase === 2 || this.phase === 3) {
      location = (await this.getLocation(eqkID, this.phase)).info_ko
      isOffshore = location.includes('해역')
    }

    this.eqkInfo = {
      lat,
      lon,
      time: new Date(time),
      location,
      magnitude: mag,
      isOffshore,
      maxIntensity,
      maxIntensityArea,
      dep,
      eqkID
    }
  }

  private async mmiBinStrHandler (data: Uint8Array): Promise<number[]> {
    const mmiArr: number[] = []

    for (const i of data) {
      mmiArr.push(i >> 4)
      mmiArr.push(i & 0b1111)
    }

    return mmiArr
  }

  phaseHandler (): void {
    switch (this.phase) {
      case 1:
        this.Wrapper.emitEvent('phase_1')
        break

      case 2:
        if (this.eqkInfo != null) {
          const eewInfo = new EEWInfo(this.eqkInfo.lat, this.eqkInfo.lon, this.eqkInfo.time,
            this.eqkInfo.location, this.eqkInfo.magnitude, this.eqkInfo.isOffshore,
            this.eqkInfo.maxIntensity, this.eqkInfo.maxIntensityArea, this.eqkInfo.eqkID
          )
          if (this._cachedPhase !== 2) {
            this.Wrapper.emitEvent('new_eew', eewInfo)
            this.logger.debug('new_eew emitted')
          }
          this.Wrapper.emitEvent('phase_2', eewInfo)
          this.logger.debug('phase_2 emitted')
        }
        break

      case 3:
        if (this.eqkInfo != null) {
          const eqkInfo = new EqkInfo(this.eqkInfo.lat, this.eqkInfo.lon, this.eqkInfo.time,
            this.eqkInfo.location, this.eqkInfo.magnitude, this.eqkInfo.isOffshore,
            this.eqkInfo.maxIntensity, this.eqkInfo.maxIntensityArea, this.eqkInfo.dep ?? -1, this.eqkInfo.eqkID
          )

          if (this._cachedPhase !== 3) {
            this.Wrapper.emitEvent('new_info', eqkInfo)
            this.logger.debug('new_info emitted')
          }

          this.Wrapper.emitEvent('phase_3', eqkInfo)
          this.logger.debug('phase_3 emitted')
        }
        break

      case 4:
        this.Wrapper.emitEvent('phase_4')
        break
    }
    this._cachedPhase = this.phase
  }

  async loop (): Promise<void> {
    while (true) {
      try {
        if (this.needSync) {
          await this.syncTime()
        }

        if (this.stopLoop) {
          break
        }

        await this.getMMI()
        this.phaseHandler()

        this.Wrapper.emitEvent('loop')
        await new Promise(resolve => setTimeout(resolve, 1000))
      } catch (err) {
        if (err instanceof HTTPError) {
          this.logger.warn(`loop(): ${err.message}`)
          this.Wrapper.emitEvent('error', err)
        } else {
          throw err
        }
      }
    }
  }

  async run (): Promise<void> {
    await this.syncTime()
    this.startTimeSyncInterval()

    // retry until getSta() success
    while (true) {
      try {
        await this.getSta()
        break
      } catch (err) {
        this.logger.warn('run(): failed to fetch station information. retrying...')
        this.Wrapper.emitEvent('error', err)
        await new Promise(resolve => setTimeout(resolve, 500))
      }
    }

    await this.loop()
  }

  stop (): void {
    this.stopLoop = true
    clearInterval(this.timeSyncIntervalID)
  }
}
