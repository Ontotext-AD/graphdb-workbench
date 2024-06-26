export class ContextType {
    constructor(id, labelKey) {
        this.id = id;
        this.labelKey = labelKey;
    }

    static getAllType() {
        return [ContextTypes.ALL, ContextTypes.EXPLICIT, ContextTypes.IMPLICIT];
    }

    static getContextType(id) {
        return this.getAllType().find((contextType) => contextType.id === id);
    }
}

export const ContextTypes = {
    'ALL': new ContextType('all', 'explore.explicit.implicit'),
    'EXPLICIT': new ContextType('explicit', 'explore.explicit'),
    'IMPLICIT': new ContextType('implicit', 'explore.implicit')
};
