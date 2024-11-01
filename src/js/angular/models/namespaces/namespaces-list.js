export class NamespacesListModel {
    constructor(namespace) {
        this._namespace = namespace;
        this.sort();
    }

    sort() {
        this._namespace.sort((a, b) => {
            const prefixA = a.prefix.toUpperCase();
            const prefixB = b.prefix.toUpperCase();
            if (prefixA < prefixB) {
                return -1;
            }
            if (prefixA > prefixB) {
                return 1;
            }
            return 0;
        });
    }
}
