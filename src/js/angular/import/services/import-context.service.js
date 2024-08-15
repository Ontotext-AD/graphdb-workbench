/**
 * The import service is implemented using many controllers and directives that share common variables.
 * The purpose of the ImportContextService is to hold data shared between them.
 */
import {cloneDeep} from "lodash";
import {ImportResourceStatus} from "../../models/import/import-resource-status";

export const TABS = {
    USER: 'user',
    SERVER: 'server'
};

angular
    .module('graphdb.framework.import.services.importcontext', [])
    .factory('ImportContextService', ImportContextService);

ImportContextService.$inject = ['EventEmitterService'];

function ImportContextService(EventEmitterService) {

    let _activeTabId = TABS.USER;
    /**
     * @type {ImportResource[]}
     * @private
     */
    let _importedResources = [];

    /**
     *
     * @type {ImportResource[]}
     * @private
     */
    let _uploadedFiles = [];

    /**
     * @type {*[]}
     * @private
     */
    let _files = [];

    let _showLoader = true;

    let _selectedFilesNames = [];

    return {
        updateActiveTabId,
        getActiveTabId,
        onActiveTabIdUpdated,
        getFiles,
        addFile,
        updateFiles,
        onFilesUpdated,
        getImportedResources,
        updateImportedResources,
        onImportedResourcesUpdated,
        getResources,
        onResourcesUpdated,
        updateShowLoader,
        getShowLoader,
        onShowLoaderUpdated,
        updateSelectedFilesNames,
        getSelectedFilesNames,
        onSelectedFilesNamesUpdated,
        updateUploadFile,
        getUploadFile,
        updateUploadFiles,
        getUploadFiles,
        onUploadFilesChanged
    };

    /**
     * @param {string[]} selectedFilesNames
     */
    function updateSelectedFilesNames(selectedFilesNames) {
        _selectedFilesNames = cloneDeep(selectedFilesNames);
        EventEmitterService.emitParallel('selectedFilesNamesUpdated', getSelectedFilesNames());
    }

    function getSelectedFilesNames() {
        return cloneDeep(_selectedFilesNames);
    }

    /**
     * Subscribes to the 'selectedFilesNamesUpdated' event.
     * @param {function} callback - The callback to be called when the event is fired.
     *
     * @return {function} unsubscribe function.
     */
    function onSelectedFilesNamesUpdated(callback) {
        return EventEmitterService.subscribeParallel('selectedFilesNamesUpdated', (selectedFilenames) => callback(selectedFilenames));
    }

    /**
     * @param {boolean} showLoader
     */
    function updateShowLoader(showLoader) {
        _showLoader = showLoader;
        EventEmitterService.emitParallel('showLoaderUpdated', getShowLoader());
    }

    function getShowLoader() {
        return _showLoader;
    }

    /**
     * Subscribes to the 'showLoaderUpdated' event.
     * @param {function} callback - The callback to be called when the event is fired.
     *
     * @return {function} unsubscribe function.
     */
    function onShowLoaderUpdated(callback) {
        return EventEmitterService.subscribeParallel('showLoaderUpdated', (showLoader) => callback(showLoader));
    }

    /**
     * Updates the active tab id of import page.
     * @param {string} activeTabId - the new view of import page. Its value have to be one of {@link OPERATION}
     */
    function updateActiveTabId(activeTabId) {
        _activeTabId = activeTabId;
        EventEmitterService.emitParallel('activeTabIdUpdated', getActiveTabId());
    }

    function getActiveTabId() {
        return _activeTabId;
    }

    /**
     * Subscribes to the 'activeTabUpdated' event.
     * @param {function} callback - The callback to be called when the event is fired.
     *
     * @return {function} unsubscribe function.
     */
    function onActiveTabIdUpdated(callback) {
        return EventEmitterService.subscribeParallel('activeTabIdUpdated', (activeTabId) => callback(activeTabId));
    }

    /**
     * Updates the list of files.
     * Emits the 'filesUpdated' event when the list of files is updated.
     * The 'filesUpdated' event contains the new list of files.
     * @param {*[]} files
     */
    function updateFiles(files) {
        _files = cloneDeep(files);
        EventEmitterService.emitParallel('filesUpdated', getFiles());
    }

    /**
     * Subscribes to the 'filesUpdated' event.
     * @param {function} callback - The callback to be called when the event is fired.
     *
     * @return {function} unsubscribe function.
     */
    function onFilesUpdated(callback) {
        return EventEmitterService.subscribeParallel('filesUpdated', (files) => callback(files));
    }

    /**
     * Adds a file to the list of files.
     * Emits the 'fileAdded' event when the file is added.
     * The 'fileAdded' event contains the added file.
     * @param {object} file - The file to be added.
     */
    function addFile(file) {
        const files = getFiles();
        files.push(file);
        updateFiles(files);
        EventEmitterService.emitParallel('fileAdded', cloneDeep(file));
    }

    /**
     * Gets the list of files.
     * @return {*[]} - The list of files.
     */
    function getFiles() {
        return cloneDeep(_files);
    }

    /**
     * Updates the resources.
     * Emits the 'resourcesUpdated' and 'importedResourcesUpdated' events when the resources are updated.
     * The 'filesUpdated' event contains the new resources.
     * @param {ImportResource[]} resources
     */
    function updateImportedResources(resources) {
        _importedResources = resources;
        EventEmitterService.emitParallel('importedResourcesUpdated', getImportedResources());
        EventEmitterService.emitParallel('resourcesUpdated', getResources());
    }

    /**
     * Gets the imported resources.
     * @return {ImportResource[]} - The imported resources.
     */
    function getImportedResources() {
        return cloneDeep(_importedResources) || [];
    }

    /**
     * Subscribes to the 'importedResourcesUpdated' event.
     * @param {function} callback - The callback to be called when the event is fired.
     *
     * @return {function} the unsubscribe function.
     */
    function onImportedResourcesUpdated(callback) {
        return EventEmitterService.subscribeParallel('importedResourcesUpdated', (importedResources) => callback(importedResources));
    }

    /**
     * Gets the resources.
     * @return {ImportResource[]} - The resources.
     */
    function getResources() {
        const importResources = getImportedResources();
        let uploadFiles = getUploadFiles();

        const uploadedFilesForRemoving = [];
        const skipImportedFiles = [];

        importResources.forEach((r) => {
            const foundResource = uploadFiles.find((uploadFile) => uploadFile.name === r.name);
            if (foundResource) {
                if (foundResource.status === ImportResourceStatus.UPLOADED) {
                    // Add to removal list if the file is not uploading (ready for import)
                    uploadedFilesForRemoving.push(foundResource);
                } else {
                    // Skip importing files that are still uploading
                    skipImportedFiles.push(foundResource);
                }
            }
        });

        // Remove uploaded files that are already imported and update the list
        if (uploadedFilesForRemoving.length > 0) {
            uploadFiles = uploadFiles.filter(
                (uploadFile) => !uploadedFilesForRemoving.some((uFR) => uFR.name === uploadFile.name)
            );
            updateUploadFiles(uploadFiles, false);
        }

        return importResources
            .filter((iR) => !skipImportedFiles.some((r) => iR.name === r.name))
            .concat(uploadFiles);
    }

    /**
     * Subscribes to the 'resourcesUpdated' event.
     * @param {function} callback - The callback to be called when the event is fired.
     *
     * @return {function} the unsubscribe function.
     */
    function onResourcesUpdated(callback) {
        return EventEmitterService.subscribeParallel('resourcesUpdated', (resources) => callback(resources));
    }

    /**
     * @param {ImportResource} updatedUploadedFile
     */
    function updateUploadFile(updatedUploadedFile) {
        const uploadFiles = getUploadFiles();
        const foundResource = uploadFiles.find((uploadFile) => uploadFile.name === updatedUploadedFile.name);
        if (foundResource) {
            Object.assign(foundResource, updatedUploadedFile);
        } else {
            uploadFiles.push(updatedUploadedFile);
        }
        updateUploadFiles(uploadFiles);
    }

    function getUploadFile(name) {
        return cloneDeep(_uploadedFiles.find((uploadFile) => uploadFile.name === name));
    }

    function updateUploadFiles(uploadedFiles, notifyResourceChanged = true) {
        _uploadedFiles = cloneDeep(uploadedFiles);
        EventEmitterService.emitParallel('uploadFilesUpdated', getUploadFiles());
        if (notifyResourceChanged) {
            EventEmitterService.emitParallel('resourcesUpdated', getResources());
        }
    }

    function getUploadFiles() {
        return cloneDeep(_uploadedFiles) || [];
    }

    /**
     * Subscribes to the 'uploadFilesUpdated' event.
     * @param {function} callback - The callback to be called when the event is fired.
     *
     * @return {function} unsubscribe function.
     */
    function onUploadFilesChanged(callback) {
        return EventEmitterService.subscribeParallel('uploadFilesUpdated', (uploadFiles) => callback(uploadFiles));
    }
}
