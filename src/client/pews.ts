import * as HTTP from './http'

export class PEWS {
  private readonly _phase = 1
  private readonly delay = 1000

  private tide: number = this.delay
  private needSync = true

  constructor () {
    this.tide = this.delay
  }

  async syncTime (): Promise<void> {
    const res = await HTTP.get('pews2.html')

    const header = res.headers
    const st = header.st as number

    this.tide = new Date().getTime() - st + this.delay
    this.needSync = false
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
