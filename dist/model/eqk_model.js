"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EqkInfo = exports.EEWInfo = void 0;
class EEWInfo {
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
    constructor(lat, lon, time, location, magnitude, isOffshore, maxIntensity, maxIntensityArea, eqkID) {
        this.lat = lat;
        this.lon = lon;
        this.time = time;
        this.location = location;
        this.magnitude = magnitude;
        this.isOffshore = isOffshore;
        this.maxIntensity = maxIntensity;
        this.maxIntensityArea = maxIntensityArea;
        this.eqkID = eqkID;
    }
    /**
     * 입력한 위·경도의 추정진도를 반환합니다.
     *
     * @param lat 위도
     * @param lon 경도
     *
     * @returns 해당하는 위·경도의 추정진도
     */
    estimatedIntensityOf(lat, lon) {
        throw new Error('Method not implemented.');
    }
    /**
     * 입력한 위·경도에 S파가 도달할 것으로 예상되는 시각을 반환합니다.
     *
     * @param lat 위도
     * @param lon 경도
     *
     * @returns 해당하는 위·경도의 S파의 예상도달시각
     */
    estimatedArrivalTimeOf(lat, lon) {
        // const distance = Math.sqrt(((this.lat - lat) * 111) ** 2 + ((this.lon - lon) * 88) ** 2) / 3
        // const arrivalTime = new Date(this.time.getTime() + distance * 1000 / 3.0)
        // return arrivalTime
        throw new Error('Method not implemented.');
    }
}
exports.EEWInfo = EEWInfo;
class EqkInfo {
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
    constructor(lat, lon, time, location, magnitude, isOffshore, maxIntensity, maxIntensityArea, depth, eqkID) {
        this.lat = lat;
        this.lon = lon;
        this.time = time;
        this.location = location;
        this.magnitude = magnitude;
        this.isOffshore = isOffshore;
        this.maxIntensity = maxIntensity;
        this.maxIntensityArea = maxIntensityArea;
        this.depth = depth;
        this.eqkID = eqkID;
    }
    /**
     * 입력한 위·경도에서 관측된 진도를 반환합니다.
     *
     * @param lat 위도
     * @param lon 경도
     *
     * @returns 해당하는 위·경도의 관측진도
     */
    intensityOf(lat, lon) {
        throw new Error('Method not implemented.');
    }
}
exports.EqkInfo = EqkInfo;
