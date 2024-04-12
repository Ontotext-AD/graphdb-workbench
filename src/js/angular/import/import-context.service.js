/**
 * The import service is implemented using many controllers and directives that share common variables.
 * The purpose of the ImportContextService is to hold data shared between them.
 */
import {cloneDeep} from "lodash";

export const TABS = {
    USER: 'user',
    SERVER: 'server'
};

angular
    .module('graphdb.framework.importcontext.service', [])
    .factory('ImportContextService', ImportContextService);

ImportContextService.$inject = ['EventEmitterService'];

function ImportContextService(EventEmitterService) {

    let _activeTabId = TABS.USER;

    /**
     * @type {*[]}
     * @private
     */
    let _files = [];

    return {
        updateActiveTabId,
        getActiveTabId,
        onActiveTabIdUpdated,
        getFiles,
        addFile,
        updateFiles,
        onFilesUpdated
    };

    /**
     * Updates the active tab id of import page.
     * @param {string} activeTabId - the new view of import page. Its value have to be one of {@link OPERATION}
     */
    function updateActiveTabId(activeTabId) {
        _activeTabId = activeTabId;
        EventEmitterService.emit('activeTabIdUpdated', getActiveTabId());
    }

    function getActiveTabId() {
        return _activeTabId;
    }

    /**
     * Subscribes to the 'activeTabUpdated' event.
     * @param {function} callback - The callback to be called when the event is fired.
     *
     * @return unsubscribe function.
     */
    function onActiveTabIdUpdated(callback) {
        return EventEmitterService.subscribe('activeTabIdUpdated', () => callback(getActiveTabId()));
    }

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
     *
     * @return unsubscribe function.
     */
    function onFilesUpdated(callback) {
        return EventEmitterService.subscribe('filesUpdated', () => callback(getFiles()));
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
