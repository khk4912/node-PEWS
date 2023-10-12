"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logger = exports.LoggingLevel = void 0;
var LoggingLevel;
(function (LoggingLevel) {
    LoggingLevel[LoggingLevel["NONE"] = -1] = "NONE";
    LoggingLevel[LoggingLevel["ERROR"] = 0] = "ERROR";
    LoggingLevel[LoggingLevel["WARN"] = 1] = "WARN";
    LoggingLevel[LoggingLevel["INFO"] = 2] = "INFO";
    LoggingLevel[LoggingLevel["DEBUG"] = 3] = "DEBUG";
})(LoggingLevel || (exports.LoggingLevel = LoggingLevel = {}));
class Logger {
    constructor(loggingLevel) {
        // eslint-disable-next-line constructor-super
        this.loggingLevel = loggingLevel;
    }
    setLevel(loggingLevel) {
        this.loggingLevel = loggingLevel;
    }
    error(msg) {
        if (this.loggingLevel >= LoggingLevel.ERROR) {
            console.log(msg);
        }
    }
    warn(msg) {
        if (this.loggingLevel >= LoggingLevel.WARN) {
            console.log(msg);
        }
    }
    info(msg) {
        if (this.loggingLevel >= LoggingLevel.INFO) {
            console.log(msg);
        }
    }
    debug(msg) {
        if (this.loggingLevel >= LoggingLevel.DEBUG) {
            console.log(msg);
        }
    }
}
exports.Logger = Logger;
