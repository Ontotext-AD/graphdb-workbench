angular
    .module('graphdb.framework.utils.workbenchsettingsstorageservice', [])
    .factory('WorkbenchSettingsStorageService', WorkbenchSettingsStorageService);

WorkbenchSettingsStorageService.$inject = ['LocalStorageAdapter', 'LSKeys'];

function WorkbenchSettingsStorageService(localStorageAdapter, LSKeys) {
    /**
     * @type {WorkbenchSettingsModel}
     */
    const defaultSettings = {
        theme: 'default-theme',
        mode: 'light',
    };

    /**
     * Gets the workbench settings from the local storage.
     * @return {WorkbenchSettingsModel}
     */
    const getWorkbenchSettings = () => {
        let settings = localStorageAdapter.get(LSKeys.WORKBENCH_SETTINGS);
        if (!settings) {
            settings = _.clone(defaultSettings);
        }
        return settings;
    };

    /**
     * Saves the workbench settings in the local storage.
     * @param {WorkbenchSettingsModel} settings
     */
    const saveWorkbenchSettings = (settings) => {
        localStorageAdapter.set(LSKeys.WORKBENCH_SETTINGS, settings);
    };

    return {
        getWorkbenchSettings,
        saveWorkbenchSettings,
    };
}
