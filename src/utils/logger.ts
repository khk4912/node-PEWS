export enum LoggingLevel {
  NONE = -1,
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3

}

export class Logger {
  private loggingLevel: LoggingLevel
  constructor (loggingLevel: LoggingLevel) {
    // eslint-disable-next-line constructor-super

    this.loggingLevel = loggingLevel
  }

  setLevel (loggingLevel: LoggingLevel): void {
    this.loggingLevel = loggingLevel
  }

  error (msg: string): void {
    if (this.loggingLevel >= LoggingLevel.ERROR) {
      console.log('[PEWS error]', msg)
    }
  }

  warn (msg: string): void {
    if (this.loggingLevel >= LoggingLevel.WARN) {
      console.log('[PEWS warn]', msg)
    }
  }

  info (msg: string): void {
    if (this.loggingLevel >= LoggingLevel.INFO) {
      console.log('[PEWS info]', msg)
    }
  }

  debug (msg: string): void {
    if (this.loggingLevel >= LoggingLevel.DEBUG) {
      console.log('[PEWS debug]', msg)
    }
  }
}
