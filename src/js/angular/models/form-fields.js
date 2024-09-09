/**
 * A model that should be used with the html select menu and the ng-options directive.
 */
export class SelectMenuOptionsModel {
    /**
     * @param {string} label
     * @param {string} value
     */
    constructor({label, value}) {
        this._label = label;
        this._value = value;
    }

    get label() {
        return this._label;
    }

    set label(value) {
        this._label = value;
    }

    get value() {
        return this._value;
    }

    set value(value) {
        this._value = value;
    }
}

/**
 * A model that should be used with html textarea elements.
 */
export class TextFieldModel {
    constructor(data) {
        /**
         * @type {string}
         * @private
         */
        this._value = data.value;
        /**
         * @type {number}
         * @private
         */
        this._minLength = data.minLength;
        /**
         * @type {number}
         * @private
         */
        this._maxLength = data.maxLength;
    }

    get value() {
        return this._value;
    }

    set value(value) {
        this._value = value;
    }

    get maxLength() {
        return this._maxLength;
    }

    set maxLength(value) {
        this._maxLength = value;
    }
    get minLength() {
        return this._minLength;
    }

    set minLength(value) {
        this._minLength = value;
    }
}

/**
 * A model that should be used with html input elements of type range.
 */
export class NumericRangeModel {
    constructor(data) {
        /**
         * @type {number}
         * @private
         */
        this._value = data.value;
        /**
         * @type {number}
         * @private
         */
        this._minValue = data.minValue;
        /**
         * @type {number}
         * @private
         */
        this._maxValue = data.maxValue;
        /**
         * @type {number}
         * @private
         */
        this._step = data.step;
    }

    get value() {
        return this._value;
    }

    set value(value) {
        this._value = value;
    }

    get minValue() {
        return this._minValue;
    }

    set minValue(value) {
        this._minValue = value;
    }

    get maxValue() {
        return this._maxValue;
    }

    set maxValue(value) {
        this._maxValue = value;
    }

    get step() {
        return this._step;
    }

    set step(value) {
        this._step = value;
    }
}
