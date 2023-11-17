export type Phase = 1 | 2 | 3 | 4

export interface LocationInfo {
  info_en: string
  info_ko: string
}

export interface StationInfo {
  name: string
  code: string
  inOp: boolean
  lat: number
  lon: number
}
