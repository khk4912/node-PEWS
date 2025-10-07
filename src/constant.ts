import { type StationDatabase, type StationInfo } from './types/pews'
import StationDB from './stations.json' assert { type: 'json' }

const STATION_DATA = StationDB as StationDatabase
const BUCKET_SCALE = 10
const NEIGHBOR_OFFSETS = [-1, 0, 1] as const

type StationEntry = StationDatabase[number]

const bucketKey = (latIndex: number, lonIndex: number): string => `${latIndex}:${lonIndex}`

const buildStationBuckets = (stations: StationDatabase): Map<string, StationEntry[]> => {
  const buckets = new Map<string, StationEntry[]>()

  for (const station of stations) {
    const latIndex = Math.floor(station.lat * BUCKET_SCALE)
    const lonIndex = Math.floor(station.lon * BUCKET_SCALE)
    const key = bucketKey(latIndex, lonIndex)
    const existing = buckets.get(key)

    if (existing) {
      existing.push(station)
    } else {
      buckets.set(key, [station])
    }
  }

  return buckets
}

export const getStationInfo = (lat: number, lon: number): StationInfo | null => {
  const latIndex = Math.floor(lat * BUCKET_SCALE)
  const lonIndex = Math.floor(lon * BUCKET_SCALE)

  let res: StationInfo | null = null

  for (const latOffset of NEIGHBOR_OFFSETS) {
    for (const lonOffset of NEIGHBOR_OFFSETS) {
      const key = bucketKey(latIndex + latOffset, lonIndex + lonOffset)
      const bucket = stationBuckets.get(key)

      if (!bucket) { continue }

      for (const station of bucket) {
        if (Math.abs(station.lat - lat) >= 0.1 ||
            Math.abs(station.lon - lon) >= 0.1) {
          continue
        }

        const info: StationInfo = {
          code: station.code,
          name: station.name,
        }

        if (!res) {
          res = info
        }
      }
    }
  }
  return res
}

const stationBuckets = buildStationBuckets(STATION_DATA)
