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
  /**
   * 지진조기경보 클래스 (phase 2)
   *
   * @param lat 추정위도
   * @param lon 추정경도
   * @param time 추정발생시각
   * @param location 발생위치 (ex. 제주 서귀포시 서남서쪽 32km 해역)
   * @param magnitude 추정규모
   * @param isOffshore 진원의 해역 여부
   * @param maxIntensity 최대예상진도
   * @param maxIntensityArea 최대 진도가 예상되는 지역
   * @param eqkID 이벤트 ID
   */
  constructor
  (public readonly lat: number, public readonly lon: number, public readonly time: Date, public readonly location: string, public readonly magnitude: number,
    public readonly isOffshore: boolean, public readonly maxIntensity: number, public readonly maxIntensityArea: string[], public readonly eqkID?: number) {
  }

  /**
   * 입력한 위·경도의 추정진도를 반환합니다.
   *
   * @param lat 위도
   * @param lon 경도
   *
   * @returns 해당하는 위·경도의 추정진도
   */
  public estimatedIntensityOf (lat: number, lon: number): never {
    throw new Error('Method not implemented.')
  }

  /**
   * 입력한 위·경도에 S파가 도달할 것으로 예상되는 시각을 반환합니다.
   *
   * @param lat 위도
   * @param lon 경도
   *
   * @returns 해당하는 위·경도의 S파의 예상도달시각
   */
  public estimatedArrivalTimeOf (lat: number, lon: number): never {
    // const distance = Math.sqrt(((this.lat - lat) * 111) ** 2 + ((this.lon - lon) * 88) ** 2) / 3
    // const arrivalTime = new Date(this.time.getTime() + distance * 1000 / 3.0)
    // return arrivalTime
    throw new Error('Method not implemented.')
  }
}

export class EqkInfo implements EarthquakeInfo {
  /**
   * 지진정보 클래스 (phase 3)
   *
   * @param lat 진앙 위도
   * @param lon 진앙 경도
   * @param time 발생시각
   * @param location 발생위치 (ex. 제주 서귀포시 서남서쪽 32km 해역)
   * @param magnitude 규모
   * @param isOffshore 해역 여부
   * @param maxIntensity 최대진도
   * @param maxIntensityArea 최대진도가 관측된 지역
   * @param depth 진원 깊이
   * @param eqkID 이벤트 ID
   */
  constructor
  (public readonly lat: number, public readonly lon: number, public readonly time: Date, public readonly location: string, public readonly magnitude: number,
    public readonly isOffshore: boolean, public readonly maxIntensity: number, public readonly maxIntensityArea: string[], public readonly depth: number,
    public readonly eqkID?: number) {
  }

  /**
   * 입력한 위·경도에서 관측된 진도를 반환합니다.
   *
   * @param lat 위도
   * @param lon 경도
   *
   * @returns 해당하는 위·경도의 관측진도
   */
  public intensityOf (lat: number, lon: number): never {
    throw new Error('Method not implemented.')
  }
}
