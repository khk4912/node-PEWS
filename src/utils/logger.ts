export const LoggingLevel = {
  NONE: 'none',
  ERROR: 'error',
  WARN: 'warn',
  INFO: 'info',
  DEBUG: 'debug'
} as const

const LoggingLevelID = {
  none: 0,
  error: 1,
  warn: 2,
  info: 3,
  debug: 4
}

type LoggingLevelType = typeof LoggingLevel[keyof typeof LoggingLevel]

export class Logger {
  private loggingLevel: typeof LoggingLevelID[keyof typeof LoggingLevelID]
  constructor (loggingLevel: LoggingLevelType) {
    this.loggingLevel = LoggingLevelID[loggingLevel]
  }

  setLevel (loggingLevel: LoggingLevelType = 'none'): void {
    this.loggingLevel = LoggingLevelID[loggingLevel]
  }

  error (msg: string): void {
    if (this.loggingLevel >= LoggingLevelID[LoggingLevel.ERROR]) {
      console.log('[PEWS error]', msg)
    }
  }

  warn (msg: string): void {
    if (this.loggingLevel >= LoggingLevelID[LoggingLevel.WARN]) {
      console.log('[PEWS warn]', msg)
    }
  }

  info (msg: string): void {
    if (this.loggingLevel >= LoggingLevelID[LoggingLevel.INFO]) {
      console.log('[PEWS info]', msg)
    }
  }

  debug (msg: string): void {
    if (this.loggingLevel >= LoggingLevelID[LoggingLevel.DEBUG]) {
      console.log('[PEWS debug]', msg)
    }
  }
}
