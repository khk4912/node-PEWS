import {
  PEWSEvents,
  type PEWSEventType,
  type PEWSEventSignatures,
} from '../types/listener_event'
import { PEWS } from './pews'

export function event(eventName?: PEWSEventType) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    if (!(target instanceof PEWS)) {
      throw new Error('event decorator can only be used in PEWS class')
    }

    if (eventName === undefined) {
      eventName = propertyKey as keyof PEWSEventSignatures
    }

    if (!PEWSEvents.includes(eventName)) {
      throw new Error(`Event name ${eventName} is not valid!`)
    }

    const t = target as any

    if (t.__decoratedEvents === undefined) {
      t.__decoratedEvents = {}
    }
    t.__decoratedEvents[eventName] = descriptor.value
  }
}
