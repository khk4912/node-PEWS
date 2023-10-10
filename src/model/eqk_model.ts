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
  constructor
  (public readonly lat: number, public readonly lon: number, public readonly time: Date, public readonly location: string, public readonly magnitude: number,
    public readonly isOffshore: boolean, public readonly maxIntensity: number, public readonly maxIntensityArea: string[], public readonly eqkID?: number) {
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
  constructor
  (public readonly lat: number, public readonly lon: number, public readonly time: Date, public readonly location: string, public readonly magnitude: number,
    public readonly isOffshore: boolean, public readonly maxIntensity: number, public readonly maxIntensityArea: string[], public readonly depth: number,
    public readonly eqkID?: number) {
  }

  public intensityOf (lat: number, lon: number): never {
    throw new Error('Method not implemented.')
  }
}
