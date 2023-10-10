import EventEmitter from 'events'
import { type TypedEventEmitter } from '../types/listener_event'

interface LoggerEvents {
  error: (msg: string) => void
  warn: (msg: string) => void
  info: (msg: string) => void
  debug: (msg: string) => void
}

export enum LoggingLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3
}

export class Logger extends (EventEmitter as new () => TypedEventEmitter<LoggerEvents>) {
  private loggingLevel: LoggingLevel
  constructor (loggingLevel: LoggingLevel) {
    // eslint-disable-next-line constructor-super
    super()

    this.loggingLevel = loggingLevel
  }

  setLevel (loggingLevel: LoggingLevel): void {
    this.loggingLevel = loggingLevel
  }

  error (msg: string): void {
    if (this.loggingLevel >= LoggingLevel.ERROR) {
      this.emit('error', msg)
    }
  }

  warn (msg: string): void {
    if (this.loggingLevel >= LoggingLevel.WARN) {
      this.emit('warn', msg)
    }
  }

  info (msg: string): void {
    if (this.loggingLevel >= LoggingLevel.INFO) {
      this.emit('info', msg)
    }
  }

  debug (msg: string): void {
    if (this.loggingLevel >= LoggingLevel.DEBUG) {
      this.emit('debug', msg)
    }
  }
}
