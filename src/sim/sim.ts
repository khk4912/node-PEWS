import { PEWSClient } from '../client/client'
import { type PEWS } from '../client/pews'

export class PEWSSimulation extends PEWSClient {
  protected readonly HEADER_LEN = 4

  constructor (wrapper: PEWS) {
    super(wrapper)
  }
}
