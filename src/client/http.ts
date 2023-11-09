import axios, { type AxiosResponse, AxiosError } from 'axios'
import { HTTPError } from '../utils/error'
import { type LocationInfo } from '../types/pews'

const client = axios.create({
  baseURL: 'https://www.weather.go.kr/pews/',
  timeout: 1000,
})

const handleError = (err: unknown, event: string): unknown => {
  if (err instanceof AxiosError) {
    if (err.code === 'ECONNABORTED' || err.status === 408) {
      return new HTTPError('Request timeout', 408, event)
    }
    if (err.response !== undefined) {
      return new HTTPError(err.message, err.response.status, event)
    }
    return new HTTPError('Unknown error', 500, event)
  }

  return err
}

/**
 * 모든 GET request에 사용됩니다.
 *
 * @param url 요청할 URL.
 * @returns AxiosResponse 객체
 */
export const get = async (url?: string): Promise<AxiosResponse> => {
  try {
    return await client.get(url ?? '')
  } catch (err) {
    throw handleError(err, 'get')
  }
}

/**
 * MMI 정보(.b)를 요청합니다.
 *
 * @param url 요청할 URL.
 * @returns AxiosResponse 객체
 */
export const getMMI = async (
  url: string,
): Promise<AxiosResponse<Uint8Array>> => {
  try {
    return await client.get(`data/${url}.b`, { responseType: 'arraybuffer' })
  } catch (err) {
    throw handleError(err, 'getMMI')
  }
}

/**
 * 관측소 정보(.s)를 요청합니다.
 *
 * @param url 요청할 URL.
 * @returns AxiosResponse 객체.
 */
export const getSta = async (
  url: string,
): Promise<AxiosResponse<Uint8Array>> => {
  try {
    return await client.get(`data/${url}.s`, { responseType: 'arraybuffer' })
  } catch (err) {
    throw handleError(err, 'getSta')
  }
}

export const getLoc = async (
  url: number,
  phase: 2 | 3,
): Promise<AxiosResponse<LocationInfo>> => {
  try {
    if (phase === 2) {
      return await client.get(`data/${url}/${url}.le`)
    } else {
      return await client.get(`data/${url}/${url}.li`)
    }
  } catch (err) {
    throw handleError(err, 'getLoc')
  }
}
