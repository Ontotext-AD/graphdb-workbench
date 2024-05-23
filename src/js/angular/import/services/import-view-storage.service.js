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

    const getIsHelpVisible = (tabId) => {
        return getImportViewSettings().getIsHelpVisible(tabId);
    }

    /**
     * Toggles the help visibility.
     * @param {string} tabId the value have to be one of {@link TABS}
     */
    const toggleHelpVisibility = (tabId) => {
        const settings = getImportViewSettings();
        settings.toggleHelpVisibility(tabId);
        localStorageAdapter.set(LSKeys.IMPORT_VIEW, settings.toJSON());
    };

    /**
     * Sets the help visibility.
     * @param {string} tabId the value have to be one of {@link TABS}
     * @param {boolean} isVisible - The visibility of the help.
     */
    const setIsHelpVisible = (tabId, isVisible) => {
        console.log('visisbility is changeddddddddddddddddddddddddddddddddddddddddddddddddddddddd')
        const settings = getImportViewSettings();
        settings.setIsHelpVisible(tabId, isVisible);
        localStorageAdapter.set(LSKeys.IMPORT_VIEW, settings.toJSON());
    };

    return {
        initImportViewSettings,
        getImportViewSettings,
        setIsHelpVisible,
        getIsHelpVisible,
        toggleHelpVisibility
    };
}
