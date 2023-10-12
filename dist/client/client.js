"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PEWSClient = void 0;
const constant_1 = require("../model/constant");
const eqk_model_1 = require("../model/eqk_model");
const error_1 = require("../utils/error");
const HTTP = __importStar(require("./http"));
const logger_1 = require("../utils/logger");
class PEWSClient {
    constructor(wrapper) {
        this.delay = 1000;
        this.logger = new logger_1.Logger(logger_1.LoggingLevel.NONE);
        this.HEADER_LEN = constant_1.HEADER_LEN;
        this._phase = 1;
        this._cachedPhase = 1;
        this.staList = [];
        this.tide = this.delay;
        this.needSync = true;
        // flag to stop loop
        this.stopLoop = false;
        this.Wrapper = wrapper;
        this.tide = this.delay;
    }
    get phase() {
        return this._phase;
    }
    escape(arr) {
        // write function that does exactly same job as escape() in ECMAScript 262
        let res = '';
        for (const x of arr) {
            const c = String.fromCharCode(x);
            if (c.match(/[A-Za-z0-9@*_+\-./]/) != null) {
                res += c;
                continue;
            }
            if (x < 256) {
                res += '%' + x.toString(16).padStart(2, '0');
            }
            else {
                res += '%u' + x.toString(16).padStart(4, '0');
            }
        }
        return res;
    }
    startTimeSyncInterval() {
        this.timeSyncIntervalID = setInterval(() => {
            this.needSync = true;
        }, constant_1.SYNC_PERIOD * 1000);
    }
    getTimeString() {
        const pad2 = (n) => {
            return n < 10 ? `0${n}` : `${n}`;
        };
        const date = new Date(new Date().getTime() - this.tide - constant_1.TZ_MSEC);
        return `${date.getFullYear()}${pad2(date.getMonth() + 1)}${pad2(date.getDate())}${pad2(date.getHours())}${pad2(date.getMinutes())}${pad2(date.getSeconds())}`;
    }
    syncTime() {
        return __awaiter(this, void 0, void 0, function* () {
            const res = yield HTTP.get('pews2.html');
            const header = res.headers;
            const st = Number(header.st);
            const dt = new Date().getTime();
            this.tide = dt - st * 1000 + this.delay;
            this.needSync = false;
        });
    }
    callback(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const mmiObj = yield this.mmiBinStrHandler(data);
            for (let i = 0; i < this.staList.length; i++) {
                this.staList[i].mmi = mmiObj[i];
            }
        });
    }
    getSta(url) {
        return __awaiter(this, void 0, void 0, function* () {
            const res = yield HTTP.getSta(url !== null && url !== void 0 ? url : this.getTimeString());
            const byteArray = res.data;
            let binaryStr = '';
            for (const i of byteArray) {
                binaryStr += i.toString(2).padStart(8, '0');
            }
            yield this.staBinStrHandler(binaryStr);
        });
    }
    staBinStrHandler(bianryStr) {
        return __awaiter(this, void 0, void 0, function* () {
            const newStaList = [];
            const staLatArr = [];
            const staLonArr = [];
            for (let i = 0; i < bianryStr.length; i += 20) {
                staLatArr.push(30 + parseInt(bianryStr.slice(i, i + 10), 2) / 100);
                staLonArr.push(120 + parseInt(bianryStr.slice(i + 10, i + 20), 2) / 100);
            }
            for (let i = 0; i < staLatArr.length; i++) {
                const station = { idx: i, lat: staLatArr[i], lon: staLonArr[i], mmi: -1 };
                newStaList.push(station);
            }
            if (newStaList.length > 99) {
                this.staList = newStaList;
            }
        });
    }
    getMMI(url) {
        return __awaiter(this, void 0, void 0, function* () {
            let res;
            url = url !== null && url !== void 0 ? url : this.getTimeString();
            try {
                res = yield HTTP.getMMI(url);
                this.logger.debug(`getMMI: ${url}`);
            }
            catch (err) {
                if (err instanceof error_1.HTTPError) {
                    this.logger.warn(`getMMI: failed to get MMI data (${err.status} ${err.message}) `);
                    return;
                }
                throw err;
            }
            const byteArray = res.data;
            let header = '';
            let binaryStr = '';
            for (let i = 0; i < this.HEADER_LEN; i++) {
                header += byteArray[i].toString(2).padStart(8, '0');
            }
            for (let i = this.HEADER_LEN; i < byteArray.length; i++) {
                binaryStr += byteArray[i].toString(2).padStart(8, '0');
            }
            const staF = header.slice(0, 1) === '1';
            if (header.slice(1, 2) === '0' && header.slice(2, 3) === '0') {
                this._phase = 1;
            }
            else if (header.slice(1, 2) === '1' && header.slice(2, 3) === '0') {
                this._phase = 2;
            }
            else if (header.slice(1, 2) === '1' && header.slice(2, 3) === '1') {
                this._phase = 3;
            }
            else if (header.slice(1, 2) === '0' && header.slice(2, 3) === '1') {
                this._phase = 4;
            }
            if (staF || this.staList.length < 99) {
                yield this.getSta();
            }
            else {
                yield this.callback(binaryStr);
            }
            const infoStrArr = [];
            for (let i = byteArray.byteLength - constant_1.MAX_EQK_STR_LEN; i < byteArray.byteLength; i++) {
                infoStrArr.push(byteArray[i]);
            }
            const eqkData = binaryStr.slice(0 - (constant_1.MAX_EQK_STR_LEN * 8 + constant_1.MAX_EQK_INFO_LEN));
            switch (this.phase) {
                case 2:
                case 3:
                    yield this.eqkHandler(eqkData, infoStrArr);
                    break;
                case 4:
                    if (this.eqkInfo != null) {
                        this.eqkInfo.eqkID = parseInt('20' + parseInt(eqkData.slice(69, 95), 2));
                    }
                    break;
            }
        });
    }
    eqkHandler(eqkData, infoStrArr) {
        return __awaiter(this, void 0, void 0, function* () {
            const lat = 30 + parseInt(eqkData.slice(0, 10), 2) / 100;
            const lon = 120 + parseInt(eqkData.slice(10, 20), 2) / 100;
            const mag = parseInt(eqkData.slice(20, 27), 2) / 10;
            const dep = parseInt(eqkData.slice(27, 37), 2) / 10;
            const time = parseInt(eqkData.slice(37, 69), 2) * 1000;
            const eqkID = parseInt('20' + parseInt(eqkData.slice(69, 95), 2));
            const maxIntensity = parseInt(eqkData.slice(95, 99), 2);
            const maxIntensityStr = eqkData.slice(99, 116);
            const maxIntensityArea = [];
            if (maxIntensityStr !== '11111111111111111') {
                for (let i = 0; i < 17; i++) {
                    if (maxIntensityStr[i] === '1') {
                        maxIntensityArea.push(constant_1.REGIONS[i]);
                    }
                }
            }
            const location = decodeURIComponent(this.escape(infoStrArr)).trim();
            const isOffshore = location.includes('해역');
            this.eqkInfo = {
                lat,
                lon,
                time: new Date(time),
                location,
                magnitude: mag,
                isOffshore,
                maxIntensity,
                maxIntensityArea,
                dep,
                eqkID
            };
        });
    }
    mmiBinStrHandler(binaryStr) {
        return __awaiter(this, void 0, void 0, function* () {
            const mmiArr = [];
            for (let i = 0; i < binaryStr.length; i += 4) {
                mmiArr.push(parseInt(binaryStr.slice(i, i + 4), 2));
            }
            for (let i = 0; i < this.staList.length; i++) {
                this.staList[i].mmi = mmiArr[i];
            }
            return mmiArr;
        });
    }
    phaseHandler() {
        var _a;
        switch (this.phase) {
            case 1:
                this.Wrapper.emitEvent('phase_1');
                break;
            case 2:
                if (this.eqkInfo != null) {
                    const eewInfo = new eqk_model_1.EEWInfo(this.eqkInfo.lat, this.eqkInfo.lon, this.eqkInfo.time, this.eqkInfo.location, this.eqkInfo.magnitude, this.eqkInfo.isOffshore, this.eqkInfo.maxIntensity, this.eqkInfo.maxIntensityArea, this.eqkInfo.eqkID);
                    if (this._cachedPhase !== 2) {
                        this.Wrapper.emitEvent('new_eew', eewInfo);
                        this.logger.debug('new_eew emitted');
                    }
                    this.Wrapper.emitEvent('phase_2', eewInfo);
                    this.logger.debug('phase_2 emitted');
                }
                break;
            case 3:
                if (this.eqkInfo != null) {
                    const eqkInfo = new eqk_model_1.EqkInfo(this.eqkInfo.lat, this.eqkInfo.lon, this.eqkInfo.time, this.eqkInfo.location, this.eqkInfo.magnitude, this.eqkInfo.isOffshore, this.eqkInfo.maxIntensity, this.eqkInfo.maxIntensityArea, (_a = this.eqkInfo.dep) !== null && _a !== void 0 ? _a : -1, this.eqkInfo.eqkID);
                    if (this._cachedPhase !== 3) {
                        this.Wrapper.emitEvent('new_info', eqkInfo);
                        this.logger.debug('new_info emitted');
                    }
                    this.Wrapper.emitEvent('phase_3', eqkInfo);
                    this.logger.debug('phase_3 emitted');
                }
                break;
            case 4:
                this.Wrapper.emitEvent('phase_4');
                break;
        }
        this._cachedPhase = this.phase;
    }
    loop() {
        return __awaiter(this, void 0, void 0, function* () {
            while (true) {
                try {
                    if (this.needSync) {
                        yield this.syncTime();
                    }
                    if (this.stopLoop) {
                        break;
                    }
                    yield this.getMMI();
                    this.phaseHandler();
                    this.Wrapper.emitEvent('loop');
                    // console.log(`loop: phase=${this.phase}, tide=${this.tide}`)
                    yield new Promise(resolve => setTimeout(resolve, 1000));
                }
                catch (err) {
                    if (err instanceof error_1.HTTPError) {
                        this.Wrapper.emitEvent('error', `loop(): error ${err.message}} occured`);
                    }
                    else {
                        throw err;
                    }
                }
            }
        });
    }
    run() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.syncTime();
            this.startTimeSyncInterval();
            // retry until getSta() success
            while (true) {
                try {
                    yield this.getSta();
                    break;
                }
                catch (err) {
                    this.Wrapper.emitEvent('error', 'run(): failed to fetch station information. retrying...');
                    yield new Promise(resolve => setTimeout(resolve, 500));
                }
            }
            yield this.getMMI();
            yield this.loop();
        });
    }
    stop() {
        this.stopLoop = true;
        clearInterval(this.timeSyncIntervalID);
    }
}
exports.PEWSClient = PEWSClient;
