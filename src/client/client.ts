import { HEADER_LEN, SYNC_PERIOD, TZ_MSEC } from '../model/constant'
import { type Station } from '../types/model'
import * as HTTP from './http'

export class PEWSClient {
  private readonly delay = 1000

  private _phase = 1
  private staList: Station[] = []
  private tide: number = this.delay
  private needSync = true

  private timeSyncIntervalID?: NodeJS.Timeout

  constructor () {
    this.tide = this.delay
  }

  get phase (): number {
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
    const res = await HTTP.getMMI(this.getTimeString())
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
    } else if (header.slice(1, 2) === '0' && header.slice(2, 3) === '1') {
      this._phase = 3
    } else if (header.slice(1, 2) === '1' && header.slice(2, 3) === '1') {
      this._phase = 4
    }
    if (staF || this.staList.length < 99) {
      await this.getSta()
    }
    await this.mmiBinStrHandler(binaryStr)
  }

  private async mmiBinStrHandler (binaryStr: string): Promise<void> {
    const mmiArr: number[] = []

    for (let i = 0; i < binaryStr.length; i += 4) {
      mmiArr.push(parseInt(binaryStr.slice(i, i + 4), 2))
    }

    for (let i = 0; i < this.staList.length; i++) {
      this.staList[i].mmi = mmiArr[i]
    }
  }

  async loop (): Promise<void> {
    while (true) {
      if (this.needSync) {
        await this.syncTime()
      }

      await this.getMMI()
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
    clearInterval(this.timeSyncIntervalID)
  }
}
