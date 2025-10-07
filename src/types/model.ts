import { type StationInfo } from './pews'

export interface Station {
  idx: number
  lat: number
  lon: number
  mmi: number
  name?: string
  info: StationInfo | null
}

export interface MMIData {
  mmiData: number[]
}
