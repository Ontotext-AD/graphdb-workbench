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
    let _resourcesForUpload = [];

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
        updateResourceForUpload,
        getResourceForUpload,
        updateResourcesForUpload,
        getResourcesForUpload,
        onResourcesForUploadChanged
    };

    /**
     * @param {string[]} selectedFilesNames
     */
    function updateSelectedFilesNames(selectedFilesNames) {
        _selectedFilesNames = cloneDeep(selectedFilesNames);
        EventEmitterService.emitSync('selectedFilesNamesUpdated', getSelectedFilesNames());
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
        return EventEmitterService.subscribeSync('selectedFilesNamesUpdated', (selectedFilenames) => callback(selectedFilenames));
    }

    /**
     * @param {boolean} showLoader
     */
    function updateShowLoader(showLoader) {
        _showLoader = showLoader;
        EventEmitterService.emitSync('showLoaderUpdated', getShowLoader());
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
        return EventEmitterService.subscribeSync('showLoaderUpdated', (showLoader) => callback(showLoader));
    }

    /**
     * Updates the active tab id of import page.
     * @param {string} activeTabId - the new view of import page. Its value have to be one of {@link OPERATION}
     */
    function updateActiveTabId(activeTabId) {
        _activeTabId = activeTabId;
        EventEmitterService.emitSync('activeTabIdUpdated', getActiveTabId());
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
        return EventEmitterService.subscribeSync('activeTabIdUpdated', (activeTabId) => callback(activeTabId));
    }

    /**
     * Updates the list of files.
     * Emits the 'filesUpdated' event when the list of files is updated.
     * The 'filesUpdated' event contains the new list of files.
     * @param {*[]} files
     */
    function updateFiles(files) {
        _files = cloneDeep(files);
        EventEmitterService.emitSync('filesUpdated', getFiles());
    }

    /**
     * Subscribes to the 'filesUpdated' event.
     * @param {function} callback - The callback to be called when the event is fired.
     *
     * @return {function} unsubscribe function.
     */
    function onFilesUpdated(callback) {
        return EventEmitterService.subscribeSync('filesUpdated', (files) => callback(files));
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
        EventEmitterService.emitSync('fileAdded', cloneDeep(file));
    }

    /**
     * Gets the list of files.
     * @return {*[]} - The list of files.
     */
    function getFiles() {
        return cloneDeep(_files);
    }

    /**
     * Updates the imported resource. Emits the 'resourcesUpdated' and 'importedResourcesUpdated' events when the resources are updated.
     * The 'resourcesUpdated' event contains the resources that are currently uploading, resources that have been uploaded but not yet returned by the backend,
     * and resources that are either imported or being imported at the moment.
     * @param {ImportResource[]} importResources
     */
    function updateImportedResources(importResources) {
        _importedResources = importResources;
        EventEmitterService.emitSync('importedResourcesUpdated', getImportedResources());
        EventEmitterService.emitSync('resourcesUpdated', getResources());
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
        return EventEmitterService.subscribeSync('importedResourcesUpdated', (importedResources) => callback(importedResources));
    }

    /**
     * Gets the resources.
     * @return {ImportResource[]} - the resources that are currently uploading, resources that have been uploaded but not yet returned by the backend,
     * and resources that are either imported or being imported at the moment.
     */
    function getResources() {
        const importResources = getImportedResources();
        let resourcesForUpload = getResourcesForUpload();

        const uploadedResources = [];
        const overridingForUploadResource = [];

        importResources.forEach(({name: importResourceName}) => {
            const foundResourceForUpdate = resourcesForUpload.find(({name: nameOfUploadingResource}) => nameOfUploadingResource === importResourceName);
            if (foundResourceForUpdate) {
                if (foundResourceForUpdate.status === ImportResourceStatus.UPLOADED) {
                    // If an already uploaded resource is found in the list of imported resources, it means we can remove it from the upload list.
                    // It is removed here, rather than after the upload is finished, to ensure that the backend has returned it. Otherwise, it may temporarily disappear.
                    uploadedResources.push(foundResourceForUpdate);
                } else {
                    // If a resource for upload is not uploaded, but it is in list of imported resources, it means that it is uploaded with overwrite option, and we have to show instance that
                    // is uploading at the moment.
                    // So we add it to list of overwriting resources later we will skip it from the resulted list with resource.

                    // If a resource is in the list of imported resources but is in the list of resources for upload, it means it was uploaded with the overwrite option,
                    // and we need to show the instance that is currently uploading.
                    // Therefore, we add it to the list of overwriting resources, so it can be skipped from the final list of resources.
                    overridingForUploadResource.push(foundResourceForUpdate);
                }
            }
        });

        if (uploadedResources.length > 0) {
            // Remove all uploaded resources that have been returned by the backend.
            resourcesForUpload = resourcesForUpload.filter(({name: nameOfUploadingResource}) => !uploadedResources.some(({name: nameOfUploadedResource}) => nameOfUploadedResource === nameOfUploadingResource));
            updateResourcesForUpload(resourcesForUpload, false);
        }

        // Finally, concatenate the resources that are currently uploading, resources that have been uploaded but not yet returned by the backend,
        // and resources that are either imported or being imported at the moment.
        return importResources
            .filter(({name: importResourceName}) => !overridingForUploadResource.some((uploadingResourceName) => importResourceName === uploadingResourceName))
            .concat(resourcesForUpload);
    }

    /**
     * Subscribes to the 'resourcesUpdated' event. It will be called when already imported resource or resources for upload are changed.
     *
     * @param {function} callback - The callback to be called when the event is fired.
     *
     * @return {function} the unsubscribe function.
     */
    function onResourcesUpdated(callback) {
        return EventEmitterService.subscribeSync('resourcesUpdated', (resources) => callback(resources));
    }

    /**
     * @param {ImportResource} updatedResourceFroUpload
     */
    function updateResourceForUpload(updatedResourceFroUpload) {
        const resourcesForUpload = getResourcesForUpload();
        const foundResource = resourcesForUpload.find(({name: nameOfResourceForUpload}) => nameOfResourceForUpload === updatedResourceFroUpload.name);
        if (foundResource) {
            Object.assign(foundResource, updatedResourceFroUpload);
        } else {
            resourcesForUpload.push(updatedResourceFroUpload);
        }
        updateResourcesForUpload(resourcesForUpload);
    }

    function getResourceForUpload(name) {
        return cloneDeep(_resourcesForUpload.find(({name: nameOfResourceForUpload}) => nameOfResourceForUpload === name));
    }

    function updateResourcesForUpload(uploadedResources, notifyResourceChanged = true) {
        _resourcesForUpload = cloneDeep(uploadedResources);
        EventEmitterService.emitSync('resourcesForUploadChanged', getResourcesForUpload());
        if (notifyResourceChanged) {
            EventEmitterService.emitSync('resourcesUpdated', getResources());
        }
    }

    function getResourcesForUpload() {
        return cloneDeep(_resourcesForUpload) || [];
    }

    /**
     * Subscribes to the 'resourcesForUploadChanged' event.
     * @param {function} callback - The callback to be called when the event is fired.
     *
     * @return {function} unsubscribe function.
     */
    function onResourcesForUploadChanged(callback) {
        return EventEmitterService.subscribeSync('resourcesForUploadChanged', (uploadFiles) => callback(uploadFiles));
    }
}
