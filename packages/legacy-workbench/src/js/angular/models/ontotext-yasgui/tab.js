/**
 * Class representing an YASQE tab instance.
 */
export class Tab {
    constructor(tab) {
        this.tab = tab;
        this.yasgui = tab.yasgui;
    }

    getId() {
        return this.tab.getId();
    }
}
