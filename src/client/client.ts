import { HEADER_LEN, MAX_EQK_INFO_LEN, MAX_EQK_STR_LEN, REGIONS, SYNC_PERIOD, TZ_MSEC } from '../model/constant'
import { EEWInfo, EqkInfo, type EarthquakeInfo, type Station } from '../model/eqk_model'
import { HTTPError } from '../utils/error'
import * as HTTP from './http'
import { type PEWS } from './pews'
import { type Phase } from '../types/pews'

export class PEWSClient {
  private readonly delay = 1000
  private readonly Wrapper: PEWS

  private _phase: Phase = 1
  private _cachedPhase: Phase = 1

  private staList: Station[] = []
  private tide: number = this.delay
  private needSync = true
  private timeSyncIntervalID?: NodeJS.Timeout

  private stopLoop = false

  // Earthqukae info
  private eqkInfo?: EarthquakeInfo

  constructor (wrapper: PEWS) {
    this.Wrapper = wrapper
    this.tide = this.delay
  }

  get phase (): Phase {
    return this._phase
  }

  private startTimeSyncInterval (): void {
    this.timeSyncIntervalID = setInterval(() => {
      this.needSync = true
    }, SYNC_PERIOD * 1000)
  }

  private getTimeString (): string {
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

  private async getSta (): Promise<any> {
    const res = await HTTP.getSta(this.getTimeString())
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

  async getMMI (): Promise<any> {
    let res
    try {
      res = await HTTP.getMMI(this.getTimeString())
    } catch (err) {
      if (err instanceof HTTPError) {
        console.log(err.message)
        return
      }

      throw err
    }

    const byteArray = res.data

    let header = ''
    let binaryStr = ''

    for (let i = 0; i < HEADER_LEN; i++) {
      header += byteArray[i].toString(2).padStart(8, '0')
    }

    for (let i = HEADER_LEN; i < byteArray.length; i++) {
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

    const infoStrArr = []

    for (let i = byteArray.byteLength - MAX_EQK_STR_LEN; i < byteArray.byteLength; i++) {
      infoStrArr.push(byteArray[i])
    }

    const eqkData = binaryStr.slice(0 - (MAX_EQK_STR_LEN * 8 + MAX_EQK_INFO_LEN))

    switch (this.phase) {
      case 2:
      case 3:
        await this.eqkHandler(eqkData, infoStrArr)
        break
      case 4:
        if (this.eqkInfo != null) {
          this.eqkInfo.eqkID = parseInt('20' + parseInt(eqkData.slice(69, 95), 2))
        }
        break
    }
  }

  private async eqkHandler (eqkData: string, infoStrArr: number[]): Promise<void> {
    const lat = 30 + parseInt(eqkData.slice(0, 10), 2) / 100
    const lon = 120 + parseInt(eqkData.slice(10, 20), 2) / 100
    const mag = parseInt(eqkData.slice(20, 27), 2)
    const dep = parseInt(eqkData.slice(27, 37), 2)
    const time = parseInt(eqkData.slice(37, 69), 2) * 1000
    const eqkID = parseInt('20' + parseInt(eqkData.slice(69, 95), 2))
    const maxIntensity = parseInt(eqkData.slice(95, 99), 2)
    const maxIntensityStr = eqkData.slice(99, 116)

    const maxIntensityArea = []

    if (maxIntensityStr !== '11111111111111111') {
      for (let i = 0; i < 17; i++) {
        if (maxIntensityStr[i] === '1') {
          maxIntensityArea.push(REGIONS[i])
        }
      }
    }

    const location = String.fromCharCode.apply(null, infoStrArr).trim()
    const isOffshore = location.includes('해상')

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
        this.Wrapper.emitEvent('on_phase_1')
        break

      case 2:
        if (this.eqkInfo != null) {
          const eewInfo = new EEWInfo(this.eqkInfo.lat, this.eqkInfo.lon, this.eqkInfo.time,
            this.eqkInfo.location, this.eqkInfo.magnitude, this.eqkInfo.isOffshore,
            this.eqkInfo.maxIntensity, this.eqkInfo.maxIntensityArea, this.eqkInfo.eqkID
          )

          if (this._cachedPhase !== 2) {
            this.Wrapper.emitEvent('on_new_eew', eewInfo)
          }
          this.Wrapper.emitEvent('on_phase_2', eewInfo)
        }
        break

      case 3:
        if (this.eqkInfo != null) {
          const eqkInfo = new EqkInfo(this.eqkInfo.lat, this.eqkInfo.lon, this.eqkInfo.time,
            this.eqkInfo.location, this.eqkInfo.magnitude, this.eqkInfo.isOffshore,
            this.eqkInfo.maxIntensity, this.eqkInfo.maxIntensityArea, this.eqkInfo.dep ?? -1, this.eqkInfo.eqkID
          )

          if (this._cachedPhase !== 3) {
            this.Wrapper.emitEvent('on_new_info', eqkInfo)
          }

          this.Wrapper.emitEvent('on_phase_3', eqkInfo)
        }
        break

      case 4:
        this.Wrapper.emitEvent('on_phase_4')
        break
    }
    this._cachedPhase = this.phase
  }

  async loop (): Promise<void> {
    while (true) {
      if (this.needSync) {
        await this.syncTime()
      }

      if (this.stopLoop) {
        break
      }

      await this.getMMI()
      this.phaseHandler()

      console.log(`loop: phase=${this.phase}, tide=${this.tide}`)
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
  }

  async run (): Promise<void> {
    await this.syncTime()
    this.startTimeSyncInterval()

    await this.getSta()
    await this.getMMI()

    await this.loop()
  }

  stop (): void {
    this.stopLoop = true
    clearInterval(this.timeSyncIntervalID)
  }
}
