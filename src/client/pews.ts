import { TZ_MSEC } from '../model/constant'
import { type Station } from '../types/model'
import * as HTTP from './http'

export class PEWS {
  private readonly _phase = 1
  private readonly delay = 1000

  private staList: Station[] = []

  private tide: number = this.delay
  private needSync = true

  constructor () {
    this.tide = this.delay
  }

  private getTimeString (): string {
    const pad2 = (n: number): string => {
      return n < 10 ? `0${n}` : `${n}`
    }

    const date = new Date(new Date().getTime() - this.tide - TZ_MSEC)
    return `${date.getFullYear()}${pad2(date.getMonth() + 1)}${pad2(date.getDate())}${pad2(date.getHours())}${pad2(date.getMinutes())}${pad2(date.getSeconds())}`
  }

  async syncTime (): Promise<void> {
    const res = await HTTP.get('pews2.html')

    const header = res.headers
    const st = Number(header.st)

    const dt = new Date().getTime()

    this.tide = dt - st * 1000 + this.delay
    this.needSync = false
  }

  private staBinStrHandler (bianryStr: string): void {
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

  async getSta (): Promise<any> {
    const res = await HTTP.getSta(this.getTimeString())
    const byteArray = new Uint8Array(res.data)

    let binaryStr = ''

    for (const i of byteArray) {
      binaryStr += i.toString(2).padStart(8, '0')
    }

    this.staBinStrHandler(binaryStr)
    console.log(this.staList)
  }

  get phase (): number {
    return this._phase
  }

  async run (): Promise<void> {
    await this.syncTime()
    await this.getSta()
  }
}
