import { type EEWInfo, type EqkInfo, type Station } from '../model/eqk_model'

export type EventType<T> = Record<keyof T, (...args: any[]) => any>

export interface TypedEventEmitter<Events extends EventType<Events>> {
  on: <E extends keyof Events>(event: E, listener: Events[E]) => this
  emit: <E extends keyof Events>(
    event: E,
    ...args: Parameters<Events[E]>
  ) => boolean
  once: <E extends keyof Events>(event: E, listener: Events[E]) => this
  addListener: <E extends keyof Events>(event: E, listener: Events[E]) => this
  removeListener: <E extends keyof Events>(
    event: E,
    listener: Events[E],
  ) => this
  removeAllListeners: <E extends keyof Events>(event?: E) => this
  listeners: <E extends keyof Events>(event: E) => Array<Events[E]>
}

export const PEWSEvents = [
  'new_eew',
  'new_info',
  'phase_1',
  'phase_2',
  'phase_3',
  'phase_4',
  'loop',
  'error',
  'mmi_event',
] as const

export type PEWSEventType = (typeof PEWSEvents)[number]

interface EventSignatures {
  new_eew: (data: EEWInfo) => any
  new_info: (data: EqkInfo) => any
  phase_1: () => any
  phase_2: (data: EEWInfo) => any
  phase_3: (data: EqkInfo) => any
  phase_4: () => any
  loop: () => any
  error: (err: unknown) => any
  mmi_event: (stations: Station[]) => any
}

export type PEWSEventSignatures = {
  [K in PEWSEventType]: EventSignatures[K]
}
