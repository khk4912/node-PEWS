import Logger from '../utils/logger'
import * as HTTP from './http'

export class PEWS {
  private readonly logger: Logger = new Logger()
  private readonly _phase = 1
  private readonly needSync = true
  private readonly delay = 1000

  private readonly tide: number

  constructor () {
    this.tide = this.delay
  }

  async syncTime (): Promise<void> {
    const res = await HTTP.get('pews2.html')
    const header = res.headers

    const st = header.st as number
  }

  get phase (): number {
    return this._phase
  }

  async run (): Promise<void> {
    while (true) {
      if (this.needSync) {
        await this.syncTime()
      }

      await new Promise(resolve => setTimeout(resolve, this.delay))
    }
  }
}
