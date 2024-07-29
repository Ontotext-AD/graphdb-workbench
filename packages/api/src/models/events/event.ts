/**
 * A generic shape of our internal event data payloads.
 */
export class Event {
    /**
     * The name of the event.
     */
    readonly NAME;
    /**
     * The payload of the event.
     */
    readonly payload;
    /**
     * Creates a new instance of the event.
     *
     * @param name - the name of the event.
     * @param payload - the payload of the event. This is optional and if omitted, the event will have no payload,
     * just a name.
     */
    constructor(name: string, payload?: any) {
        this.NAME = name;
        this.payload = payload;
    }
}
