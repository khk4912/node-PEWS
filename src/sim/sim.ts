import { PEWSClient } from '../client/client'
import { type PEWS } from '../client/pews'
import { TZ_MSEC } from '../model/constant'
import { HTTPError } from '../utils/error'

export class SimulationPEWS extends PEWSClient {
  protected HEADER_LEN = 1

  private readonly eqkID: number
  private currentTime: Date
  private readonly endTime: Date

  private increaseTimeIntervalID?: NodeJS.Timeout

  constructor (wrapper: PEWS, eqkID: number, startTime: Date, endTime: Date) {
    super(wrapper)

    this.eqkID = eqkID
    this.currentTime = new Date(startTime.getTime() - TZ_MSEC)
    this.endTime = new Date(endTime.getTime() - TZ_MSEC)
  }

  protected getTimeString (): string {
    const pad2 = (n: number): string => {
      return n < 10 ? `0${n}` : `${n}`
    }

    return `${this.currentTime.getFullYear()}${pad2(this.currentTime.getMonth() + 1)}${pad2(this.currentTime.getDate())}${pad2(this.currentTime.getHours())}${pad2(this.currentTime.getMinutes())}${pad2(this.currentTime.getSeconds())}`
  }

  private increaseTime (): void {
    this.currentTime = new Date(this.currentTime.getTime() + 1000)

    if (this.currentTime.getTime() > this.endTime.getTime()) {
      this.stop()
    }
  }

  private startIncreaseTimeInterval (): void {
    this.increaseTimeIntervalID = setInterval(() => {
      this.increaseTime()
    }, 1000)
  }

  async loop (): Promise<void> {
    while (true) {
      try {
        if (this.stopLoop) {
          break
        }

        await this.getMMI(`${this.eqkID}/${this.getTimeString()}`)

        this.phaseHandler()
        this.Wrapper.emitEvent('loop')

        await new Promise(resolve => setTimeout(resolve, 1000))
      } catch (err) {
        if (err instanceof HTTPError) {
          this.logger.warn(`loop(): ${err.message}`)
          this.Wrapper.emitEvent('error', err)
        } else {
          throw err
        }
      }
    }
  }

  async run (): Promise<void> {
    this.startIncreaseTimeInterval()

    while (true) {
      try {
        await this.getSta(`${this.eqkID}/${this.getTimeString()}`)
        break
      } catch (err) {
        this.logger.warn('run(): failed to fetch station information. retrying...')
        await new Promise(resolve => setTimeout(resolve, 500))
      }
    }
    await this.loop()
  }

  stop (): void {
    this.stopLoop = true
    if (this.increaseTimeIntervalID !== undefined) {
      clearInterval(this.increaseTimeIntervalID)
    }
  }
}
