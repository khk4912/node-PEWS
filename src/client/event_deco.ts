import {
  PEWSEvents,
  type PEWSEventType,
  type PEWSEventSignatures,
} from '../types/listener_event'
import { PEWS } from './pews'

export function event<T extends PEWSEventType>(eventName?: T) {
  return function <
    X extends typeof eventName,
    Y extends PEWSEventType | string,
  >(
    target: any,
    propertyKey: Y,
    descriptor: X extends PEWSEventType
      ? TypedPropertyDescriptor<PEWSEventSignatures[T]>
      : Y extends PEWSEventType
      ? TypedPropertyDescriptor<PEWSEventSignatures[Y]>
      : never,
  ) {
    if (!(target instanceof PEWS)) {
      throw new Error('event decorator can only be used in PEWS class')
    }

    let evt: PEWSEventType

    if (eventName === undefined) {
      evt = propertyKey as PEWSEventType
    } else {
      evt = eventName
    }

    if (!PEWSEvents.includes(evt)) {
      throw new Error(`Event name ${eventName} is not valid!`)
    }

    const t = target as any

    if (t.__decoratedEvents === undefined) {
      t.__decoratedEvents = {}
    }
    t.__decoratedEvents[evt] = descriptor.value
  }
}
