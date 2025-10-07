export interface StationInfo {
  code: string
  name: string
}

export interface StationRecord extends StationInfo {
  lat: number
  lon: number
}

export enum AlertPhase {
  NONE = 1,          // 경보 없음
  EARLY_WARNING = 2, // 지진조기경보
  INFO = 3,          // 지진정보
  OVERSEAS = 4,      // 해외?
}

export interface WarningInfo {
  lat: number
  lon: number
  magnitude: number
  eqkTime: Date
  eqkID: number
  eqkMaxAreas: string[]
}

export interface EarthquakeEarlyWarning extends WarningInfo {
}

export interface EarthquakeInfo extends WarningInfo {
  depth: number
}

export type StationDatabase = StationRecord[]
