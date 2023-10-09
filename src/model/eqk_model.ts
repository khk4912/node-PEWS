export interface Station {
  idx: number
  lat: number
  lon: number
  mmi?: number
}

export interface EarthquakeInfo {
  lat: number
  lon: number
  time: Date
  location: string
  magnitude: number
  isOffshore: boolean
  maxIntensity: number
  maxIntensityArea: string[]
  dep?: number
  eqkID?: number
}

export class EEWInfo implements EarthquakeInfo {
  public readonly lat: number
  public readonly lon: number
  public readonly time: Date
  public readonly location: string
  public readonly magnitude: number
  public readonly isOffshore: boolean
  public readonly maxIntensity: number
  public readonly maxIntensityArea: string[]
  public readonly eqkID?: number

  constructor
  (lat: number, lon: number, time: Date, location: string, magnitude: number,
    isOffshore: boolean, maxIntensity: number, maxIntensityArea: string[], eqkID?: number) {
    this.lat = lat
    this.lon = lon
    this.time = time
    this.location = location
    this.magnitude = magnitude
    this.isOffshore = isOffshore
    this.maxIntensity = maxIntensity
    this.maxIntensityArea = maxIntensityArea
    this.eqkID = eqkID
  }

  public estimatedIntensityOf (lat: number, lon: number): never {
    throw new Error('Method not implemented.')
  }

  public estimatedArrivalTimeOf (lat: number, lon: number): never {
    // const distance = Math.sqrt(((this.lat - lat) * 111) ** 2 + ((this.lon - lon) * 88) ** 2) / 3
    // const arrivalTime = new Date(this.time.getTime() + distance * 1000 / 3.0)
    // return arrivalTime
    throw new Error('Method not implemented.')
  }
}

export class EqkInfo implements EarthquakeInfo {
  public readonly lat: number
  public readonly lon: number
  public readonly time: Date
  public readonly location: string
  public readonly magnitude: number
  public readonly isOffshore: boolean
  public readonly maxIntensity: number
  public readonly maxIntensityArea: string[]
  public readonly eqkID?: number

  public readonly depth: number

  constructor
  (lat: number, lon: number, time: Date, location: string, magnitude: number,
    isOffshore: boolean, maxIntensity: number, maxIntensityArea: string[], depth: number, eqkID?: number) {
    this.lat = lat
    this.lon = lon
    this.time = time
    this.location = location
    this.magnitude = magnitude
    this.isOffshore = isOffshore
    this.maxIntensity = maxIntensity
    this.maxIntensityArea = maxIntensityArea
    this.eqkID = eqkID
    this.depth = depth
  }

  public intensityOf (lat: number, lon: number): never {
    throw new Error('Method not implemented.')
  }
}
