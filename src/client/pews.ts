import { getRequestURL } from './utils'

export class PEWS {
  /**
   * Station 정보를 불러옵니다.
   *
   * @param url 요청할 URL (optional, undefined일 경우 현재 시각 기준 요청)
   * @param callbackData fn_callback() 함수에 전달할 데이터 (optional)
   */
  protected async getStation (url?: string, callbackData?: ArrayBuffer): Promise<ArrayBuffer> {
    const data = (await fetch(url ?? getRequestURL('s') + 'json')).arrayBuffer()

    return await data
  }
}
