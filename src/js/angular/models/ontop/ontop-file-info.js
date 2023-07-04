export class OntopFileInfo {

    /**
     * Initializes ontop file info object.
     * @param {string} type - the type of ontop file. It's value have to be one of {@link OntopFileType};
     * @param {boolean} required - true if file is required.
     */
    constructor(type, required = false) {
        this.type = type;
        this.fileName = '';
        this.loading = false;
        this.required = required;
    }
}
