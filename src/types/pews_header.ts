import { type AxiosResponseHeaders } from 'axios'

interface PEWS_Header extends AxiosResponseHeaders {
  st: number
}

export default PEWS_Header
