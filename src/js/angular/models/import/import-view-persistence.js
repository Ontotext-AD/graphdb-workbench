export class ImportViewPersistence {
    constructor(jsonData = {}) {
        this._isHelpVisible = jsonData.isHelpVisible !== undefined ? jsonData.isHelpVisible : true;
    }

    get isHelpVisible() {
        return this._isHelpVisible;
    }

    set isHelpVisible(value) {
        this._isHelpVisible = value;
    }

    toggleHelpVisibility() {
        this._isHelpVisible = !this._isHelpVisible;
    }

    toJSON() {
        return {
            isHelpVisible: this._isHelpVisible
        };
    }
}
