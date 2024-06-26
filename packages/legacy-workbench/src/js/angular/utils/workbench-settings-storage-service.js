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
        mode: 'light'
    };

    /**
     * Gets the workbench settings from the local storage.
     * @return {WorkbenchSettingsModel}
     */
    const getWorkbenchSettings = () => {
        let settings = localStorageAdapter.get(LSKeys.WORKBENCH_SETTINGS);
        if (!settings) {
            settings = defaultSettings;
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

    /**
     * Gets the theme name from the workbench settings stored in the local storage.
     * @return {string|string|null|*}
     */
    const getThemeName = () => {
        const settings = getWorkbenchSettings();
        if (settings && settings.theme) {
            return settings.theme;
        }
    };

    /**
     * Updates the workbench settings with the new theme name.
     * @param {string} themeName The theme name.
     */
    const saveTheme = (themeName) => {
        const settings = getWorkbenchSettings();
        settings.theme = themeName;
        localStorageAdapter.set(LSKeys.WORKBENCH_SETTINGS, settings);
    };

    return {
        getWorkbenchSettings,
        saveWorkbenchSettings,
        getThemeName,
        saveTheme
    };
}
