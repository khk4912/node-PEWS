export interface Station {
    idx: number;
    lat: number;
    lon: number;
    mmi?: number;
}
export interface EarthquakeInfo {
    lat: number;
    lon: number;
    time: Date;
    location: string;
    magnitude: number;
    isOffshore: boolean;
    maxIntensity: number;
    maxIntensityArea: string[];
    dep?: number;
    eqkID?: number;
}
export declare class EEWInfo implements EarthquakeInfo {
    readonly lat: number;
    readonly lon: number;
    readonly time: Date;
    readonly location: string;
    readonly magnitude: number;
    readonly isOffshore: boolean;
    readonly maxIntensity: number;
    readonly maxIntensityArea: string[];
    readonly eqkID?: number | undefined;
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
    constructor(lat: number, lon: number, time: Date, location: string, magnitude: number, isOffshore: boolean, maxIntensity: number, maxIntensityArea: string[], eqkID?: number | undefined);
    /**
     * 입력한 위·경도의 추정진도를 반환합니다.
     *
     * @param lat 위도
     * @param lon 경도
     *
     * @returns 해당하는 위·경도의 추정진도
     */
    estimatedIntensityOf(lat: number, lon: number): never;
    /**
     * 입력한 위·경도에 S파가 도달할 것으로 예상되는 시각을 반환합니다.
     *
     * @param lat 위도
     * @param lon 경도
     *
     * @returns 해당하는 위·경도의 S파의 예상도달시각
     */
    estimatedArrivalTimeOf(lat: number, lon: number): never;
}
export declare class EqkInfo implements EarthquakeInfo {
    readonly lat: number;
    readonly lon: number;
    readonly time: Date;
    readonly location: string;
    readonly magnitude: number;
    readonly isOffshore: boolean;
    readonly maxIntensity: number;
    readonly maxIntensityArea: string[];
    readonly depth: number;
    readonly eqkID?: number | undefined;
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
    constructor(lat: number, lon: number, time: Date, location: string, magnitude: number, isOffshore: boolean, maxIntensity: number, maxIntensityArea: string[], depth: number, eqkID?: number | undefined);
    /**
     * 입력한 위·경도에서 관측된 진도를 반환합니다.
     *
     * @param lat 위도
     * @param lon 경도
     *
     * @returns 해당하는 위·경도의 관측진도
     */
    intensityOf(lat: number, lon: number): never;
}
