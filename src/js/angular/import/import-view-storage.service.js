import {ImportViewPersistence} from "../models/import/import-view-persistence";

angular
    .module('graphdb.framework.import.importviewstorageservice', [])
    .factory('ImportViewStorageService', ImportViewStorageService);

ImportViewStorageService.$inject = ['LocalStorageAdapter', 'LSKeys'];

function ImportViewStorageService(localStorageAdapter, LSKeys) {

    const defaultImportViewPersistence = new ImportViewPersistence();

    const initImportViewSettings = () => {
        // TODO: this is called 3 times on view init
        // localStorageAdapter.set(LSKeys.IMPORT_VIEW, defaultImportViewPersistence);
    };

    const getImportViewSettings = () => {
        let settings = localStorageAdapter.get(LSKeys.IMPORT_VIEW);
        if (!settings) {
            settings = defaultImportViewPersistence;
        }
        return new ImportViewPersistence(settings);
    };

    // toggle help visibility
    const toggleHelpVisibility = () => {
        const settings = getImportViewSettings();
        settings.toggleHelpVisibility();
        localStorageAdapter.set(LSKeys.IMPORT_VIEW, settings.toJSON());
    };

    return {
        initImportViewSettings,
        getImportViewSettings,
        toggleHelpVisibility
    };
}
