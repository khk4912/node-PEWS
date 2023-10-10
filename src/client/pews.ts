import { SimulationPEWS } from '../sim/sim'
import { type PEWSEvents, type TypedEventEmitter } from '../types/listener_event'
import { type Logger } from '../utils/logger'

import { PEWSClient } from './client'
import EventEmitter from 'events'

export class PEWS extends (EventEmitter as new () => TypedEventEmitter<PEWSEvents>) {
  private readonly PEWSClient: PEWSClient
  public readonly logger: Logger

  constructor (sim = false, eqkID?: number, startTime?: Date, endTime?: Date) {
    // FIXME: need to remove this eslint-igonre in future
    // eslint-disable-next-line constructor-super
    super()

    if (sim) {
      if (eqkID === undefined || startTime === undefined || endTime === undefined) {
        throw new Error('eqkID, startTime, endTime must be given when sim is true!')
      }
      this.PEWSClient = new SimulationPEWS(this, eqkID, startTime, endTime)
    } else {
      this.PEWSClient = new PEWSClient(this)
    }

    this.logger = this.PEWSClient.logger
  }

  start (): void {
    void this.PEWSClient.run()
  }

  emitEvent<E extends keyof PEWSEvents>(event: E, ...args: Parameters<PEWSEvents[E]>): void {
    // console.log(event, args)
    this.emit(event, ...args)
  }

  stop (): void {
    this.PEWSClient.stop()
  }
}
