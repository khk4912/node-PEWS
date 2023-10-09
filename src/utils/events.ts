import { EventEmitter } from 'events'
import { type EEWInfo, type EqkInfo } from '../model/eqk_model'
import { type TypedEventEmitter } from '../types/listener_event'

interface PEWSEvents {
  new_eew: (data: EEWInfo) => any
  new_eqk: (data: EqkInfo) => any
  on_new_eew: (data: EEWInfo) => any
  on_new_info: (data: EqkInfo) => any
  on_phase_1: () => any
  on_phase_2: (data: EEWInfo) => any
  on_phase_3: (data: EqkInfo) => any
  on_phase_4: () => any
  error: (err: Error) => any
}

export const PEWSEventEmitter = new EventEmitter() as TypedEventEmitter<PEWSEvents>
