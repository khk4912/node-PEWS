import { type PEWSEvents, type TypedEventEmitter } from '../types/listener_event'

import { PEWSClient } from './client'
import EventEmitter from 'events'

export class PEWS extends (EventEmitter as new () => TypedEventEmitter<PEWSEvents>) {
  private readonly PEWSClient: PEWSClient

  constructor (sim = false) {
    // FIXME: need to remove this eslint-igonre in future
    // eslint-disable-next-line constructor-super
    super()

    // TODO: change to SimulationClient when it's ready
    this.PEWSClient = sim ? new PEWSClient(this) : new PEWSClient(this)
  }

  start (): void {
    void this.PEWSClient.run()
  }

  emitEvent<E extends keyof PEWSEvents>(event: E, args: Parameters<PEWSEvents[E]>): void {
    this.emit(event, ...args)
  }

  stop (): void {
    this.PEWSClient.stop()
  }
}
