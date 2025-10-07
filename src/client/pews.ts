import { getStationInfo } from '../constant'
import type { MMIData, Station } from '../types/model'
import { getRequestURL } from './utils'

export class PEWS {
  public stations: Station[] = []
  public TIDE = 1000

  public async start (): Promise<void> {
    await this.getStation()
    await this.getMMI()

    while (true) {
      await this.getMMI()
      await new Promise((resolve) => setTimeout(resolve, 1000))
    }
  }

  /**
   * Station 정보를 불러옵니다.
   * 만약 callbackData가 주어지면, 해당 데이터를 파싱해 Station의 MMI 정보를 callbackData 기반으로 업데이트합니다.
   *
   * @param {string} url  요청할 URL (optional, undefined일 경우 현재 시각 기준 요청)
   * @param {ArrayBuffer} callbackData MMI 데이터를 즉시 반영하기 위한 getMMI 에서 얻은 ArrayBuffer 데이터 (optional)
   *
   *
   * @returns {Promise<Station[]>} 서버에서 받아온 Station 데이터
   * @example
   * // 현재 시각 기준으로 Station 정보를 불러옵니다.
   * await PEWS.getStation()
   *
   * // 특정 URL로부터 Station 정보를 불러옵니다.
   * await PEWS.getStation('https://www.weather.go.kr/pews/data/20210914120000.s')
   */
  public async getStation (url?: string, callbackData?: ArrayBuffer): Promise<Station[]> {
    const data = await (await fetch(url ?? getRequestURL('s', this.TIDE))).arrayBuffer()

    this._handleStationData(data)
    if (callbackData) { this.updateMMI(callbackData) }

    return this.stations
  }

  /**
   * .s 파일로부터 받아온 ArrayBuffer 데이터를 파싱합니다.
   *
   * Station 정보를 담은 Station array를 반환하고,
   * this.station의 데이터도 업데이트합니다.
   *
   * @param data .s 파일로부터 받아온 ArrayBuffer 데이터
   * @returns {Station[]} 파싱한 Station array
   *
   * @throws {Error} Station 정보가 99개 이하일 경우
   */
  private _handleStationData (data: ArrayBuffer): Station[] {
    const byteArray = new Uint8Array(data)

    let bitBuffer = 0
    let bitsInBuffer = 0
    let byteIndex = 0

    const readBits = (bitCount: number): number => {
      while (bitsInBuffer < bitCount) {
        if (byteIndex >= byteArray.length) {
          throw new Error('Station 데이터 파싱 중 예기치 않은 EOF가 발생했습니다.')
        }

        bitBuffer = (bitBuffer << 8) | byteArray[byteIndex++]
        bitsInBuffer += 8
      }

      const shift = bitsInBuffer - bitCount
      const mask = (1 << bitCount) - 1
      const value = (bitBuffer >> shift) & mask

      bitsInBuffer -= bitCount
      bitBuffer &= bitsInBuffer > 0 ? (1 << bitsInBuffer) - 1 : 0

      return value
    }

    const totalStations = Math.floor((byteArray.length * 8) / 20)
    const newStationArr: Station[] = new Array(totalStations)

    for (let idx = 0; idx < totalStations; idx++) {
      const lat = (readBits(10) / 100) + 30
      const lon = (readBits(10) / 100) + 120

      // 울릉도, 태하 위경도 보정
      if ((lat === 37.48 && lon === 120.89) || (lat === 37.51 && lon === 120.81)) {
        const info = getStationInfo(lat, lon + 10)
        newStationArr[idx] = { idx, lat, lon: lon + 10, mmi: 0, info }
        continue
      }

      const info = getStationInfo(lat, lon)
      newStationArr[idx] = { idx, lat, lon, mmi: 0, info }
    }

    if (newStationArr.length <= 99) {
      throw new Error('Station 정보를 불러오는 데 실패한 것 같습니다. Station 데이터가 99개 이하입니다.')
    }

    this.stations = newStationArr
    return newStationArr
  }

  /**
   * MMI 정보를 불러오고 업데이트합니다.
   * @param url 요청할 URL (optional, undefined일 경우 현재 시각 기준 요청)
   * @returns {Promise<Station[]>} 업데이트된 Station 배열
   */
  public async getMMI (url?: string): Promise<Station[]> {
    const data = await (await fetch(url ?? getRequestURL('b', this.TIDE))).arrayBuffer()
    return this.updateMMI(data)
  }

  /**
   * ArrayBuffer 데이터를 기반으로 Station의 MMI 정보를 업데이트합니다. (= fn_callback)
   * @param data getMMI()로부터 받아온 ArrayBuffer 데이터
   * @returns 업데이트된 Station 배열
   */
  protected updateMMI (data: ArrayBuffer): Station[] {
    const mmiData = this._handleMMIData(data)

    for (let i = 0; i < Math.min(this.stations.length, mmiData.mmiData.length); i++) {
      this.stations[i].mmi = mmiData.mmiData[i]
    }
    return this.stations
  }

  private _handleMMIData (data: ArrayBuffer): MMIData {
    const byteArray = new Uint8Array(data)
    const totalValues = byteArray.length * 2

    if (totalValues === 0) {
      return { mmiData: [] }
    }

    const mmiData = new Array<number>(totalValues)
    let writeIndex = 0

    for (let i = 0; i < byteArray.length; i++) {
      const byte = byteArray[i]
      mmiData[writeIndex++] = byte >> 4
      mmiData[writeIndex++] = byte & 0x0f
    }

    return { mmiData }
  }
}
