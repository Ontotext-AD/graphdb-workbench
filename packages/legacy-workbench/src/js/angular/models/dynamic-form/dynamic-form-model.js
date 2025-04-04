export class DynamicFormModel {
    /**
     * List with all models.
     * @type {DynamicFormGroup[]|DynamicFormField[]}
     * @private
     */
    _models = [];

    constructor(data) {
        this._models = data || [];
    }

    get models() {
        return this._models;
    }

    set models(value) {
        this._models = value;
    }
}

export class DynamicFormGroup {
    /**
     * The unique key of the group.
     * @type {string}
     * @private
     */
    _groupId = '';
    /**
     * Fields within the group.
     * @type {DynamicFormField[]}
     * @private
     */
    _fields = [];
    /**
     * Fields that should be hidden.
     * @type {DynamicFormField[]}
     * @private
     */
    _hiddenFields = [];

    constructor(data) {
        this._fields = data.fields || [];
        this._hiddenFields = data.hiddenFields || [];
        this._groupId = data.groupId || '';
    }

    get fields() {
        return this._fields;
    }

    set fields(value) {
        this._fields = value;
    }

    get hiddenFields() {
        return this._hiddenFields;
    }

    set hiddenFields(value) {
        this._hiddenFields = value;
    }

    get groupId() {
        return this._groupId;
    }

    set groupId(value) {
        this._groupId = value;
    }
}
