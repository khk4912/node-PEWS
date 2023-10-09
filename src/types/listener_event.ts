import { type EEWInfo, type EqkInfo } from '../model/eqk_model'

export interface TypedEventEmitter<Events extends EventType<Events>> {
  on: <E extends keyof Events>(event: E, listener: Events[E]) => this
  emit: <E extends keyof Events>(event: E, ...args: Parameters<Events[E]>) => boolean
  once: <E extends keyof Events>(event: E, listener: Events[E]) => this
  addListener: <E extends keyof Events>(event: E, listener: Events[E]) => this
  removeListener: <E extends keyof Events>(event: E, listener: Events[E]) => this
  removeAllListeners: <E extends keyof Events>(event?: E) => this
  listeners: <E extends keyof Events>(event: E) => Array<Events[E]>
}

export interface PEWSEvents {
  new_eew: (data: EEWInfo) => any
  new_eqk: (data: EqkInfo) => any
  on_new_eew: (data: EEWInfo) => any
  on_new_info: (data: EqkInfo) => any
  on_phase_1: () => any
  on_phase_2: (data: EEWInfo) => any
  on_phase_3: (data: EqkInfo) => any
  on_phase_4: () => any
  error: (err: unknown) => any
}

export type EventType<T> = Record<keyof T, (...args: any[]) => any>
