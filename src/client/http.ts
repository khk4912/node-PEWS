import axios, { type AxiosResponse, AxiosError } from 'axios'
import { HTTPError } from '../utils/error'

const client = axios.create({
  baseURL: 'https://www.weather.go.kr/pews/',
  timeout: 1000
})

const handleError = (err: unknown, event: string): unknown => {
  if (err instanceof AxiosError && err.response !== undefined) {
    return new HTTPError(err.message, err.response.status, event)
  }
  return err
}

export const get = async (url?: string): Promise<AxiosResponse> => {
  try {
    return await client.get(url ?? '')
  } catch (err) {
    throw handleError(err, 'get')
  }
}

export const getMMI = async (url: string): Promise<AxiosResponse<Uint8Array>> => {
  try {
    return await client.get(`data/${url}.m`, { responseType: 'arraybuffer' })
  } catch (err) {
    throw handleError(err, 'getMMI')
  }
}

export const getSta = async (url: string): Promise<AxiosResponse<Uint8Array>> => {
  try {
    return await client.get(`data/${url}.s`, { responseType: 'arraybuffer' })
  } catch (err) {
    throw handleError(err, 'getSta')
  }
}
