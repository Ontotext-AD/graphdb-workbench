/**
 * Model of all events fired by "ontotext-yasgui".
 */
export class EventData {
    constructor(TYPE, payload) {
        this.TYPE = TYPE;
        this.payload = payload;
    }
}
