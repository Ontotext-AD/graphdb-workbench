export const WorkbenchEventType = {
    'LANGUAGE_CHANGED': 'languageChangeEvent'
}

export class WorkbenchEvent {
    readonly NAME;
    readonly payload;
    constructor(name: string, payload?: any) {
        this.NAME = name;
        this.payload = payload;
    }
}
