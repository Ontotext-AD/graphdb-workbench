const modules = [];

angular
    .module('graphdb.framework.core.services.theme-service', modules)
    .factory('ThemeService', ThemeService);

ThemeService.$inject = ['WorkbenchSettingsStorageService'];

export const DARK_MODE = 'dark';

function ThemeService(WorkbenchSettingsStorageService) {
    /**
     * Applies the dark theme mode if it's saved in the local storage with the workbench settings. Otherwise the dark
     * mode is not applied.
     */
    const applyDarkThemeMode = () => {
        const workbenchSettings = WorkbenchSettingsStorageService.getWorkbenchSettings();
        if (workbenchSettings.mode === DARK_MODE) {
            const rootElement = document.querySelector(':root');
            rootElement.classList.add(DARK_MODE);
        }
    };

    /**
     * Toggles the theme mode: light or dark. If the provided mode is set, then remove it and vice versa.
     * @param {string} mode
     */
    const toggleThemeMode = (mode) => {
        const rootElement = document.querySelector(':root');
        if (mode === DARK_MODE) {
            rootElement.classList.add(DARK_MODE);
        } else {
            rootElement.classList.remove(DARK_MODE);
        }
    };

    const getAppliedTheme = () => {
        return WorkbenchSettingsStorageService.getWorkbenchSettings().mode;
    };

    return {
        applyDarkThemeMode,
        toggleThemeMode,
        getAppliedTheme,
    };
}

