/**
 * A generic shape of our internal event data payloads.
 */
export class Event<T extends {} | undefined> {
  /**
     * The name of the event.
     */
  readonly NAME: string;
  /**
     * The payload of the event.
     */
  readonly payload: T | undefined;
  /**
     * Creates a new instance of the event.
     *
     * @param name - the name of the event.
     * @param payload - the payload of the event. This is optional and if omitted, the event will have no payload,
     * just a name.
     */
  constructor(name: string, payload?: T) {
    this.NAME = name;
    this.payload = payload;
  }
}
