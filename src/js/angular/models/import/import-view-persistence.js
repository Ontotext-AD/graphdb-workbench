import {TABS} from "../../import/services/import-context.service";

export class ImportViewPersistence {
    constructor(jsonData = {}) {
        this._persistence = {};
        this._persistence[TABS.USER] = {}
        this._persistence[TABS.SERVER] = {}
        this._persistence[[TABS.USER]].isHelpVisible = jsonData && jsonData[TABS.USER] !== undefined ? jsonData[TABS.USER].isHelpVisible : true;
        this._persistence[[TABS.SERVER]].isHelpVisible = jsonData && jsonData[TABS.SERVER] !== undefined ? jsonData[TABS.SERVER].isHelpVisible : true;
    }

    getIsHelpVisible(tabId) {
        return this._persistence[tabId].isHelpVisible;
    }

    setIsHelpVisible(tabId, value) {
        this._persistence[tabId].isHelpVisible = value;
    }

    toggleHelpVisibility(tabId) {
        this.setIsHelpVisible(tabId, !this._persistence[tabId].isHelpVisible);
    }

    toJSON() {
        return JSON.stringify(this._persistence);
    }
}
