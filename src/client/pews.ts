import { type Station } from '../model/eqk_model'
import { SimulationPEWS } from '../sim/sim'
import {
  type PEWSEvents,
  type TypedEventEmitter,
} from '../types/listener_event'
import { type Logger } from '../utils/logger'

import { PEWSClient } from './client'
import { EventEmitter } from 'events'

export class PEWS extends (EventEmitter as new () => TypedEventEmitter<PEWSEvents>) {
  private readonly PEWSClient: PEWSClient
  public readonly logger: Logger

  public readonly sim: boolean

  public readonly eqkID?: number
  public readonly startTime?: Date
  public readonly endTime?: Date
  /**
   * PEWS Client
   *
   * @param sim 시뮬레이션 여부
   * @param eqkID 시뮬레이션에 사용할 지진 ID
   * @param startTime 시뮬레이션 시작 시각
   * @param endTime 시뮬레이션 종료 시각
   */
  constructor(sim = false, eqkID?: number, startTime?: Date, endTime?: Date) {
    // FIXME: need to remove this eslint-igonre in future
    // eslint-disable-next-line constructor-super
    super()

    this.sim = sim

    if (sim) {
      if (
        eqkID === undefined ||
        startTime === undefined ||
        endTime === undefined
      ) {
        throw new Error(
          'eqkID, startTime, endTime must be given when sim is true!',
        )
      }
      this.eqkID = eqkID
      this.startTime = startTime
      this.endTime = endTime

      this.PEWSClient = new SimulationPEWS(this, eqkID, startTime, endTime)
    } else {
      this.PEWSClient = new PEWSClient(this)
    }

    this.logger = this.PEWSClient.logger

    const self = this as any

    if (self.__decoratedEvents !== undefined) {
      for (const event in self.__decoratedEvents) {
        this.on(event as keyof PEWSEvents, self.__decoratedEvents[event])
      }

      delete self.__decoratedEvents
    }
  }

  start(): void {
    void this.PEWSClient.run()
  }

  emitEvent<E extends keyof PEWSEvents>(
    event: E,
    ...args: Parameters<PEWSEvents[E]>
  ): void {
    this.emit(event, ...args)
  }

  stop(): void {
    this.PEWSClient.stop()
  }

  get stations(): Station[] {
    return this.PEWSClient.stations
  }
}
