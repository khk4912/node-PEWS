import { type AxiosResponse } from 'axios';
/**
 * 모든 GET request에 사용됩니다.
 *
 * @param url 요청할 URL.
 * @returns AxiosResponse 객체
 */
export declare const get: (url?: string) => Promise<AxiosResponse>;
/**
 * MMI 정보(.b)를 요청합니다.
 *
 * @param url 요청할 URL.
 * @returns AxiosResponse 객체
 */
export declare const getMMI: (url: string) => Promise<AxiosResponse<Uint8Array>>;
/**
 * 관측소 정보(.s)를 요청합니다.
 *
 * @param url 요청할 URL.
 * @returns AxiosResponse 객체.
 */
export declare const getSta: (url: string) => Promise<AxiosResponse<Uint8Array>>;
