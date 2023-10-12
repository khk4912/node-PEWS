"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SimulationData = void 0;
const pews_1 = require("../client/pews");
/**
 * 사용자 맞춤형 지진정보서비스에서 기본적으로 제공되는 시뮬레이션 데이터

 */
exports.SimulationData = {
    JEJU: new pews_1.PEWS(true, 2021007178, new Date(2021, 11, 14, 17, 19, 9), new Date(2021, 11, 14, 17, 27, 23)),
    POHANG: new pews_1.PEWS(true, 2017000407, new Date(2017, 10, 15, 14, 29, 21), new Date(2017, 10, 15, 14, 34, 20)),
    GYEONGJU: new pews_1.PEWS(true, 2016000291, new Date(2016, 8, 12, 20, 32, 44), new Date(2016, 8, 12, 20, 37, 43))
};
