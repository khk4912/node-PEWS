export class HTTPError extends Error {
  public status: number
  public eventName: string

  constructor (message: string, status: number, eventName: string) {
    super(message)
    this.status = status
    this.eventName = eventName
  }
}
