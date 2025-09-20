export interface Station {
  idx: number
  lat: number
  lon: number
  mmi: number
  name?: string
}

export interface MMIData {
  mmiData: number[]
}
