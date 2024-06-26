export class SaveQueryOpened {
    constructor(eventData) {
        this.tab = eventData.payload.tab;
    }

    getTab() {
        return this.tab;
    }
}
