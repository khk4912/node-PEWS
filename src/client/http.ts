import axios, { type AxiosResponse } from 'axios'

const client = axios.create({
  baseURL: 'https://www.weather.go.kr/pews/',
  timeout: 1000
})

export const get = async (url?: string): Promise<AxiosResponse> => {
  return await client.get(url ?? '')
}

export const getMMI = async (url: string): Promise < AxiosResponse > => {
  return await client.get(`${url}.b`)
}
