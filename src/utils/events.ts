import { EventEmitter } from 'events'
import { type EEWInfo, type EqkInfo } from '../types/model'

type EventType<T> = Record<keyof T, (...args: any[]) => any>

interface PEWSEvents {
  newEEW: (data: EEWInfo) => any
  newEqk: (data: EqkInfo) => any
}

interface TypedEventEmitter<Events extends EventType<Events>> {
  on: <E extends keyof Events>(event: E, listener: Events[E]) => this
  emit: <E extends keyof Events>(event: E, ...args: Parameters<Events[E]>) => boolean
  once: <E extends keyof Events>(event: E, listener: Events[E]) => this
  addListener: <E extends keyof Events>(event: E, listener: Events[E]) => this
  removeListener: <E extends keyof Events>(event: E, listener: Events[E]) => this
  removeAllListeners: <E extends keyof Events>(event?: E) => this
  listeners: <E extends keyof Events>(event: E) => Array<Events[E]>
}

export const PEWSEventEmitter = new EventEmitter() as TypedEventEmitter<PEWSEvents>
