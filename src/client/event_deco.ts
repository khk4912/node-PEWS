import { PEWSEventList, type PEWSEvents } from '../types/listener_event'
import { PEWS } from './pews'

export function event (eventName?: keyof PEWSEvents) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    if (!(target instanceof PEWS)) {
      throw new Error('event decorator can only be used in PEWS class')
    }

    if (eventName === undefined) {
      eventName = propertyKey as keyof PEWSEvents
    }

    if (!PEWSEventList.includes(eventName)) {
      throw new Error(`Event name ${eventName} is not valid!`)
    }

    const t = target as any

    if (t.__decoratedEvents === undefined) {
      t.__decoratedEvents = {}
    }
    t.__decoratedEvents[eventName] = descriptor.value
  }
}