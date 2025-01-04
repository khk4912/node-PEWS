import type { Station } from '../types/model'
import { getRequestURL } from './utils'

export class PEWS {
  protected station: Station[] = []

  /**
   * Station 정보를 불러옵니다.
   * 만약 callbackData가 주어지면, 해당 데이터를 파싱해 Station의 MMI 정보를 callbackData 기반으로 업데이트합니다.
   *
   * @param {string} url  요청할 URL (optional, undefined일 경우 현재 시각 기준 요청)
   * @param {ArrayBuffer} callbackData MMI 데이터를 즉시 반영하기 위한 getMMI 에서 얻은 ArrayBuffer 데이터 (optional)
   *
   *
   * @returns {Station[]} 서버에서 받아온 Station 데이터
   * @example
   * // 현재 시각 기준으로 Station 정보를 불러옵니다.
   * await PEWS.getStation()
   *
   * // 특정 URL로부터 Station 정보를 불러옵니다.
   * await PEWS.getStation('https://www.weather.go.kr/pews/data/20210914120000.s')
   */
  protected async getStation (url?: string, callbackData?: ArrayBuffer): Promise<Station[]> {
    const data = await (await fetch(url ?? getRequestURL('s'))).arrayBuffer()

    return this._handleStationData(data)
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
    let binaryStr = ''

    const byteArray = new Uint8Array(data)
    byteArray.forEach(byte => {
      binaryStr += byte.toString(2).padStart(8, '0')
    })

    const newStationArr: Station[] = []

    let idx = 0

    for (let i = 0; i < binaryStr.length; i += 20) {
      const lat = parseInt(binaryStr.slice(i, i + 10), 2) / 100
      const lon = parseInt(binaryStr.slice(i + 10, i + 20), 2) / 100

      newStationArr.push({ idx: idx++, lat, lon, mmi: 0 })
    }

    if (newStationArr.length <= 99) {
      throw new Error('Station 정보를 불러오는 데 실패한 것 같습니다. Station 데이터가 99개 이하입니다.')
    }

    this.station = newStationArr
    return newStationArr
  }
}
