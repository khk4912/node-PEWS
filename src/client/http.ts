import axios, {
  AxiosError,
  type AxiosInstance,
  type AxiosResponse,
} from 'axios'

import { HTTPError } from '../utils/error'
import { type LocationInfo } from '../types/pews'

const handleHTTPError = (
  _: any,
  propertyKey: string,
  descriptor: PropertyDescriptor,
): any => {
  const method = descriptor.value

  descriptor.value = async function (...args: any[]) {
    try {
      const res = method.apply(this, args)

      if (res instanceof Promise) {
        return await res
      }

      return res
    } catch (error) {
      throw handleError(error, propertyKey)
    }
  }
}

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

export class HTTP {
  private readonly client: AxiosInstance

  constructor(sim: boolean = false, eqkID?: number) {
    if (sim && eqkID === undefined) {
      throw new Error('eqkID must be given when sim is true!')
    }

    this.client = axios.create({
      baseURL: sim
        ? `https://www.weather.go.kr/pews/data/${eqkID}`
        : 'https://www.weather.go.kr/pews/data',
    })
  }

  @handleHTTPError
  async getMMI(url?: string): Promise<AxiosResponse<Uint8Array>> {
    return await this.client.get(`${url}.b`, { responseType: 'arraybuffer' })
  }

  @handleHTTPError
  async getSta(url?: string): Promise<AxiosResponse<Uint8Array>> {
    return await this.client.get(`${url}.s`, { responseType: 'arraybuffer' })
  }

  @handleHTTPError
  async getLoc(
    url: number,
    phase: 2 | 3,
  ): Promise<AxiosResponse<LocationInfo>> {
    if (phase === 2) {
      return await this.client.get(`${url}.le`)
    }

    return await this.client.get(`${url}.li`)
  }

  @handleHTTPError
  async getGrid(url: string, phase: 2 | 3): Promise<AxiosResponse<Uint8Array>> {
    if (phase === 2) {
      return await this.client.get(`${url}.e`, { responseType: 'arraybuffer' })
    }

    return await this.client.get(`${url}.i`, { responseType: 'arraybuffer' })
  }

  @handleHTTPError
  async getST(): Promise<number> {
    const res = await axios.get('https://www.weather.go.kr/pews/')
    return res.headers.st
  }
}
