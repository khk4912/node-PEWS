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
exports.getSta = exports.getMMI = exports.get = void 0;
const axios_1 = __importStar(require("axios"));
const error_1 = require("../utils/error");
const client = axios_1.default.create({
    baseURL: 'https://www.weather.go.kr/pews/',
    timeout: 1000
});
const handleError = (err, event) => {
    if (err instanceof axios_1.AxiosError) {
        if (err.code === 'ECONNABORTED') {
            return new error_1.HTTPError('Request timeout', 408, event);
        }
        if (err.response !== undefined) {
            return new error_1.HTTPError(err.message, err.response.status, event);
        }
        return new error_1.HTTPError('Unknown error', 500, event);
    }
    return err;
};
/**
 * 모든 GET request에 사용됩니다.
 *
 * @param url 요청할 URL.
 * @returns AxiosResponse 객체
 */
const get = (url) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        return yield client.get(url !== null && url !== void 0 ? url : '');
    }
    catch (err) {
        throw handleError(err, 'get');
    }
});
exports.get = get;
/**
 * MMI 정보(.b)를 요청합니다.
 *
 * @param url 요청할 URL.
 * @returns AxiosResponse 객체
 */
const getMMI = (url) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        return yield client.get(`data/${url}.b`, { responseType: 'arraybuffer' });
    }
    catch (err) {
        throw handleError(err, 'getMMI');
    }
});
exports.getMMI = getMMI;
/**
 * 관측소 정보(.s)를 요청합니다.
 *
 * @param url 요청할 URL.
 * @returns AxiosResponse 객체.
 */
const getSta = (url) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        return yield client.get(`data/${url}.s`, { responseType: 'arraybuffer' });
    }
    catch (err) {
        throw handleError(err, 'getSta');
    }
});
exports.getSta = getSta;
