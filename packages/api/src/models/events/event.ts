export const EventType = {
    'LANGUAGE_CHANGED': 'languageChangeEvent'
}

export class Event {
    readonly NAME;
    readonly payload;
    constructor(name: string, payload?: any) {
        this.NAME = name;
        this.payload = payload;
    }
}
