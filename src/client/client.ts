import { HEADER_LEN, MAX_EQK_INFO_LEN, MAX_EQK_STR_LEN, REGIONS, SYNC_PERIOD, TZ_MSEC } from '../model/constant'
import { EEWInfo, EqkInfo, type EarthquakeInfo, type Station } from '../model/eqk_model'
import { HTTPError } from '../utils/error'
import * as HTTP from './http'
import { type PEWS } from './pews'
import { type LocationInfo, type Phase } from '../types/pews'
import { Logger, LoggingLevel } from '../utils/logger'

export class PEWSClient {
  private readonly delay = 1000
  private readonly Wrapper: PEWS

  public readonly logger: Logger = new Logger(LoggingLevel.NONE)

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

  private async callback (data: string): Promise<void> {
    const mmiObj = await this.mmiBinStrHandler(data)

    for (let i = 0; i < this.staList.length; i++) {
      this.staList[i].mmi = mmiObj[i]
    }
  }

  protected async getSta (url?: string): Promise<any> {
    const res = await HTTP.getSta(url ?? this.getTimeString())
    const byteArray = res.data

    let binaryStr = ''

    for (const i of byteArray) {
      binaryStr += i.toString(2).padStart(8, '0')
    }

    await this.staBinStrHandler(binaryStr)
  }

  private async staBinStrHandler (bianryStr: string): Promise<void> {
    const newStaList: Station[] = []
    const staLatArr: number[] = []
    const staLonArr: number[] = []

    for (let i = 0; i < bianryStr.length; i += 20) {
      staLatArr.push(30 + parseInt(bianryStr.slice(i, i + 10), 2) / 100)
      staLonArr.push(120 + parseInt(bianryStr.slice(i + 10, i + 20), 2) / 100)
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

    let header = ''
    let binaryStr = ''

    for (let i = 0; i < this.HEADER_LEN; i++) {
      header += byteArray[i].toString(2).padStart(8, '0')
    }

    for (let i = this.HEADER_LEN; i < byteArray.length; i++) {
      binaryStr += byteArray[i].toString(2).padStart(8, '0')
    }

    const staF = header.slice(0, 1) === '1'

    if (header.slice(1, 2) === '0' && header.slice(2, 3) === '0') {
      this._phase = 1
    } else if (header.slice(1, 2) === '1' && header.slice(2, 3) === '0') {
      this._phase = 2
    } else if (header.slice(1, 2) === '1' && header.slice(2, 3) === '1') {
      this._phase = 3
    } else if (header.slice(1, 2) === '0' && header.slice(2, 3) === '1') {
      this._phase = 4
    }

    if (staF || this.staList.length < 99) {
      await this.getSta()
    } else {
      await this.callback(binaryStr)
    }

    // const infoStrArr = []

    // for (let i = byteArray.byteLength - MAX_EQK_STR_LEN; i < byteArray.byteLength; i++) {
    //   infoStrArr.push(byteArray[i])
    // }

    const eqkData = binaryStr.slice(0 - (MAX_EQK_STR_LEN * 8 + MAX_EQK_INFO_LEN))

    switch (this.phase) {
      case 2:
      case 3:
        await this.eqkHandler(eqkData)
        break
      case 4:
        if (this.eqkInfo != null) {
          this.eqkInfo.eqkID = parseInt('20' + parseInt(eqkData.slice(69, 95), 2))
        }
        break
    }
  }

  private async getLocation (eqkID: number, phase: 2 | 3): Promise<LocationInfo> {
    this.logger.debug(`getLocation: ${eqkID}`)
    return (await HTTP.getLoc(eqkID, phase)).data
  }

  private async eqkHandler (eqkData: string, infoStrArr?: number[]): Promise<void> {
    const lat = 30 + parseInt(eqkData.slice(0, 10), 2) / 100
    const lon = 120 + parseInt(eqkData.slice(10, 20), 2) / 100
    const mag = parseInt(eqkData.slice(20, 27), 2) / 10
    const dep = parseInt(eqkData.slice(27, 37), 2) / 10
    const time = parseInt(eqkData.slice(37, 69), 2) * 1000
    const eqkID = parseInt('20' + parseInt(eqkData.slice(69, 95), 2))
    const maxIntensity = parseInt(eqkData.slice(95, 99), 2)
    const maxIntensityStr = eqkData.slice(99, 116)
    const maxIntensityArea = []

    let location = ''
    let isOffshore = false

    if (maxIntensityStr !== '11111111111111111') {
      for (let i = 0; i < 17; i++) {
        if (maxIntensityStr[i] === '1') {
          maxIntensityArea.push(REGIONS[i])
        }
      }
    }

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

  private async mmiBinStrHandler (binaryStr: string): Promise<number[]> {
    const mmiArr: number[] = []

    for (let i = 0; i < binaryStr.length; i += 4) {
      mmiArr.push(parseInt(binaryStr.slice(i, i + 4), 2))
    }

    for (let i = 0; i < this.staList.length; i++) {
      this.staList[i].mmi = mmiArr[i]
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
          this.Wrapper.emitEvent('error', `loop(): error ${err.message}} occured`)
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
        this.Wrapper.emitEvent('error', 'run(): failed to fetch station information. retrying...')
        await new Promise(resolve => setTimeout(resolve, 500))
      }
    }

    await this.getMMI()
    await this.loop()
  }

  stop (): void {
    this.stopLoop = true
    clearInterval(this.timeSyncIntervalID)
  }
}
