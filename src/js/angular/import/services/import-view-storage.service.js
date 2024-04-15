import {ImportViewPersistence} from "../../models/import/import-view-persistence";

angular
    .module('graphdb.framework.import.services.importviewstorageservice', [])
    .factory('ImportViewStorageService', ImportViewStorageService);

ImportViewStorageService.$inject = ['LocalStorageAdapter', 'LSKeys'];

function ImportViewStorageService(localStorageAdapter, LSKeys) {

    const defaultImportViewPersistence = new ImportViewPersistence();

    /**
     * Initializes the import view settings. If the import view settings are not saved yet,
     * then the default settings are used.
     */
    const initImportViewSettings = () => {
        // TODO: this is called 3 times on view init
        if (!localStorageAdapter.get(LSKeys.IMPORT_VIEW)) {
            localStorageAdapter.set(LSKeys.IMPORT_VIEW, defaultImportViewPersistence);
        }
    };

    /**
     * Returns the import view settings from the local storage. If the import view settings are not saved yet,
     * then the default settings are returned.
     * @return {ImportViewPersistence}
     */
    const getImportViewSettings = () => {
        let settings = localStorageAdapter.get(LSKeys.IMPORT_VIEW);
        if (!settings) {
            settings = defaultImportViewPersistence;
        }
        return new ImportViewPersistence(settings);
    };

    /**
     * Toggles the help visibility.
     */
    const toggleHelpVisibility = () => {
        const settings = getImportViewSettings();
        settings.toggleHelpVisibility();
        localStorageAdapter.set(LSKeys.IMPORT_VIEW, settings.toJSON());
    };

    /**
     * Sets the help visibility.
     * @param {boolean} isVisible - The visibility of the help.
     */
    const setHelpVisibility = (isVisible) => {
        const settings = getImportViewSettings();
        settings.isHelpVisible = isVisible;
        localStorageAdapter.set(LSKeys.IMPORT_VIEW, settings.toJSON());
    };

    return {
        initImportViewSettings,
        getImportViewSettings,
        toggleHelpVisibility,
        setHelpVisibility
    };
}
