export const ImportStatus = {
    PENDING: 'PENDING',
    SUCCESS: 'SUCCESS',
    FAIL: 'FAIL',
    SKIP: 'SKIP'
}

export const ImportStatusLabelKeys = {
    [ImportStatus.PENDING]: 'graphql.endpoints_management.import_definition_modal.status.pending',
    [ImportStatus.SUCCESS]: 'graphql.endpoints_management.import_definition_modal.status.completed',
    [ImportStatus.FAIL]: 'graphql.endpoints_management.import_definition_modal.status.failed',
    [ImportStatus.SKIP]: 'graphql.endpoints_management.import_definition_modal.status.not_allowed'
};

export const ImportStatusToViewMapping = {
    [ImportStatus.PENDING]: 'tag-warning',
    [ImportStatus.SUCCESS]: 'tag-success',
    [ImportStatus.FAIL]: 'tag-danger',
    [ImportStatus.SKIP]: 'tag-info'
};

export class EndpointDefinitionFileList {
    /**
     * @type {Array<EndpointDefinitionFile>}
     * @private
     */
    _list;
    /**
     * @type {number}
     * @private
     */
    _size;

    constructor(definitionFiles = []) {
        this._list = definitionFiles;
        this._size = definitionFiles.length;
    }

    /**
     * Processes the list of definition files with the given predicate.
     * @param {function(EndpointDefinitionFile): void} predicate The predicate to process the files with.
     */
    processWith(predicate) {
        this.list.forEach(predicate);
    }

    /**
     * Finds a definition file by file name.
     * @param {string} name The name of the file to find.
     * @returns {EndpointDefinitionFile}
     */
    findDefinitionFileByName(name) {
        return this.list.find(definitionFile => definitionFile.file.name === name);
    }

    /**
     * Extracts the file names from the list of definition files.
     * @returns {string[]}
     */
    getFileNames() {
        return this.list.map(definitionFile => definitionFile.file.name);
    }

    /**
     * Appends the given files to the list of definition files.
     * @param {EndpointDefinitionFile[]} definitionFiles The files to append.
     */
    appendFiles(definitionFiles) {
        this.list.push(...definitionFiles);
        this._size = this.list.length;
    }

    /**
     * Removes the given file from the list of definition files.
     * @param {EndpointDefinitionFile} definitionFileToRemove The file to remove.
     */
    removeFile(definitionFileToRemove) {
        this.list = this.list.filter(definitionFile => definitionFile.file !== definitionFileToRemove.file);
    }

    get size() {
        return this._size;
    }

    set size(size) {
        this._size = size;
    }

    set list(definitionFiles) {
        this._list = definitionFiles;
        this._size = definitionFiles.length;
    }

    get list() {
        return this._list;
    }
}

export class EndpointDefinitionFile {
    /**
     * @type {EndpointDefinitionFileList}
     * @private
     */
    _list;
    /**
     * @type {File}
     * @private
     */
    _file;
    /**
     * The file name of the definition file. This is the name of the file that was uploaded and can also be obtained
     * from the file object. The reason for having it here is that when an archive is uploaded, the file object will
     * contain the name of the archive file, but the definition files are extracted from the archive and each of them
     * has a different name. This property is used to keep track of the original file name.
     * @type {string}
     * @private
     */
    _filename;
    /**
     * @type {'pending'|'success'|'fail'|'not_allowed'}
     * @private
     */
    _status;
    /**
     * This is a string which is a css class name that will be used to display the status as a tag.
     * @type {string}
     * @private
     */
    _viewStatus;
    /**
     * @type {string}
     * @private
     */
    _statusMessage;
    /**
     * @type {string|null}
     * @private
     */
    _endpointId;
    /**
     * @type {EndpointGenerationReport|undefined}
     * @private
     */
    _report;

    constructor(file, status, statusMessage, list) {
        this._file = file;
        this._status = status;
        this._viewStatus = ImportStatusToViewMapping[status];
        this._statusMessage = statusMessage;
        this._list = list;
    }

    set file(file) {
        this._file = file;
    }

    get file() {
        return this._file;
    }

    set filename(filename) {
        this._filename = filename;
    }

    get filename() {
        return this._filename;
    }

    set status(status) {
        this._status = status;
        this._viewStatus = ImportStatusToViewMapping[status];
    }

    get status() {
        return this._status;
    }

    set viewStatus(viewStatus) {
        this._viewStatus = viewStatus;
    }

    get viewStatus() {
        return this._viewStatus;
    }

    set statusMessage(statusMessage) {
        this._statusMessage = statusMessage;
    }

    get statusMessage() {
        return this._statusMessage;
    }

    set endpointId(endpointId) {
        this._endpointId = endpointId;
    }

    get endpointId() {
        return this._endpointId;
    }

    set report(report) {
        this._report = report;
    }

    get report() {
        return this._report;
    }

    get list() {
        return this._list;
    }

    set list(list) {
        this._list = list;
    }
}
