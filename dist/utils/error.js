"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HTTPError = void 0;
class HTTPError extends Error {
    constructor(message, status, eventName) {
        super(message);
        this.status = status;
        this.eventName = eventName;
    }
}
exports.HTTPError = HTTPError;
