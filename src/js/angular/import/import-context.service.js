import {cloneDeep} from "lodash";

angular
    .module('graphdb.framework.importcontext.service', [])
    .factory('ImportContextService', ImportContextService);

ImportContextService.$inject = ['EventEmitterService'];

function ImportContextService(EventEmitterService) {
    /**
     * @type {*[]}
     * @private
     */
    let _files = [];

    return {
        getFiles,
        addFile,
        updateFiles,
        onFilesUpdated
    };

    /**
     * Updates the list of files.
     * Emits the 'filesUpdated' event when the list of files is updated.
     * The 'filesUpdated' event contains the new list of files.
     * @param {*[]} files
     */
    function updateFiles(files) {
        _files = files;
        EventEmitterService.emit('filesUpdated', getFiles());
    }

    /**
     * Subscribes to the 'filesUpdated' event.
     * @param {function} callback - The callback to be called when the event is fired.
     */
    function onFilesUpdated(callback) {
        EventEmitterService.subscribe('filesUpdated', () => callback(getFiles()));
    }

    /**
     * Adds a file to the list of files.
     * Emits the 'fileAdded' event when the file is added.
     * The 'fileAdded' event contains the added file.
     * @param {object} file - The file to be added.
     */
    function addFile(file) {
        _files.push(file);
        EventEmitterService.emit('fileAdded', cloneDeep(file));
    }

    /**
     * Gets the list of files.
     * @return {*[]} - The list of files.
     */
    function getFiles() {
        return cloneDeep(_files);
    }
}
