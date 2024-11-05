export class NamespacesListModel {
    constructor(namespaces = []) {
        this._namespaces = namespaces;
        this.sort();
    }

    get namespaces() {
        return this._namespaces;
    }

    sort() {
        this._namespaces.sort((a, b) => {
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
