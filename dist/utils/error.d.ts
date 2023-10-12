export declare class HTTPError extends Error {
    status: number;
    eventName: string;
    constructor(message: string, status: number, eventName: string);
}
