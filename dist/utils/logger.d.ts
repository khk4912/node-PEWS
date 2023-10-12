export declare enum LoggingLevel {
    NONE = -1,
    ERROR = 0,
    WARN = 1,
    INFO = 2,
    DEBUG = 3
}
export declare class Logger {
    private loggingLevel;
    constructor(loggingLevel: LoggingLevel);
    setLevel(loggingLevel: LoggingLevel): void;
    error(msg: string): void;
    warn(msg: string): void;
    info(msg: string): void;
    debug(msg: string): void;
}
