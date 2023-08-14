const modules = [];

angular
    .module('graphdb.framework.core.services.theme-service', modules)
    .factory('ThemeService', ThemeService);

ThemeService.$inject = ['WorkbenchSettingsStorageService', '$translate', 'toastr'];

const THEMES_EXTENSION = 'themes';
const DEFAULT_THEME = 'default-theme';
const DARK_MODE = 'dark';

const THEME_DEFINITION_PLUGIN_MODEL = {
    'name': null,
    'label': null,
    'primary-color-hue': null,
    'primary-color-saturation': null,
    'primary-color-lightness': null,
    'secondary-color-hue': null,
    'secondary-color-saturation': null,
    'secondary-color-lightness': null,
    'tertiary-color-hue': null,
    'tertiary-color-saturation': null,
    'tertiary-color-lightness': null,
    'icon-on-primary-color': null,
    'grey-rgb': null,
    'grey-color': null,
    'color-danger-dark': null,
    'color-success-dark': null,
    'color-warning-dark': null,
    'color-info-dark': null
};

function ThemeService(workbenchSettingsStorageService, $translate, toastr) {

    /**
     * Applies the theme mode saved in the local storage in the document.
     */
    const applyDarkThemeMode = () => {
        const workbenchSettings = workbenchSettingsStorageService.getWorkbenchSettings();
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

    /**
     * @return {{name: string, label: string}} The default theme names and labels.
     */
    const getDefaultTheme = () => {
      const defaultThemeDefinition = getDefaultThemeDefinition();
      return {
          name: defaultThemeDefinition.name,
          label: $translate.instant(defaultThemeDefinition.label) || defaultThemeDefinition.label
      };
    };

    /**
     * @param {string} themeName
     * @return {Object|undefined} A theme definition obtained from the PluginRegistry by name.
     */
    const getThemeDefinitionByName = (themeName) => {
        return PluginRegistry.findPlugin(THEMES_EXTENSION, (themeDefinition) => themeDefinition.name === themeName);
    };

    /**
     * @return {Object|undefined} The registered default theme definition obtained from the PluginRegistry.
     */
    const getDefaultThemeDefinition = () => {
      return getThemeDefinitionByName(DEFAULT_THEME);
    };

    /**
     * @return {Object|undefined} The selected theme definition saved in the local storage obtained from the
     * PluginRegistry.
     */
    const getSelectedThemeDefinition = () => {
        const workbenchTheme = workbenchSettingsStorageService.getTheme();
        return getThemeDefinitionByName(workbenchTheme);
    };

    /**
     * @return {{name: string, label: string}} The selected theme or the default theme name and label.
     */
    const getTheme = () => {
        let theme;
        const selectedThemeDefinition = getSelectedThemeDefinition();
        if (selectedThemeDefinition) {
            theme = {
                name: selectedThemeDefinition.name,
                label: $translate.instant(selectedThemeDefinition.label) || selectedThemeDefinition.label
            };
        } else {
            theme = getDefaultTheme();
        }
        return theme;
    };

    /**
     * @return {{name: string, label: string}[]} An array with all registered theme names and labels.
     */
    const getThemes = () => {
        const themeDefinitions = PluginRegistry.get(THEMES_EXTENSION);
        return themeDefinitions
            .filter(validateThemeDefinition)
            .map((themeDefinition) => ({
                name: themeDefinition.name,
                label: $translate.instant(themeDefinition.label) || themeDefinition.label
            }));
    };

    /**
     * @param {Object} themeDefinition
     * @return {boolean}
     */
    const validateThemeDefinition = (themeDefinition) => {
        const validationResult = [];
        Object.keys(THEME_DEFINITION_PLUGIN_MODEL).forEach((prop) => {
            if (!(prop in themeDefinition)) {
                validationResult.push(prop);
            }
        });
        if (validationResult.length) {
            toastr.error($translate.instant('security.workbench.settings.theme.validation.missing-fields'));
            console.error(`
            Color theme validation error. Found missing colors in plugin theme: ${validationResult.join('')}.
            Check the developers guide how to create a valid color theme.`);
            return false;
        }
        return true;
    };

    /**
     * Gets a theme definition. If there is a saved theme, then theme definition with that name loaded from
     * PluginRegistry and returned. Otherwise the default theme definition is returned.
     * @return {Object}
     */
    const getThemeDefinition = () => {
        const workbenchTheme = workbenchSettingsStorageService.getTheme();
        let selectedThemeDefinition = PluginRegistry.findPlugin(THEMES_EXTENSION, (themeDefinition) => themeDefinition.name === workbenchTheme);
        if (!selectedThemeDefinition) {
            selectedThemeDefinition = getDefaultThemeDefinition();
        }
        return selectedThemeDefinition;
    };

    /**
     * Builds a stylesheet model using the theme definition.
     * @param {Object} themeDefinition
     * @return {CSSStyleSheet}
     */
    const buildStylheet = (themeDefinition) => {
        const stylesheetContent = themeTag(themeDefinition);
        const stylesheet = new CSSStyleSheet();
        stylesheet.title = themeDefinition.name;
        stylesheet.replaceSync(stylesheetContent);
        return stylesheet;
    };

    /**
     * Applies a theme with the provided theme name. The theme definition is obtained through the PluginRegistry and the
     * theme definition is converted to a live stylesheet model which is then applied in the document.
     * @param {string} themeName
     */
    const applyTheme = (themeName) => {
      const themeDefinition = getThemeDefinitionByName(themeName);
      const stylesheet = buildStylheet(themeDefinition);
      document.adoptedStyleSheets = [stylesheet];
    };

    const themeTag = (themeDefinition) => {
        return `
            :root {
                --primary-color-hue: ${themeDefinition['primary-color-hue']};
                --primary-color-saturation: ${themeDefinition['primary-color-saturation']};
                --primary-color-lightness: ${themeDefinition['primary-color-lightness']};
                --primary-color-hsl: var(--primary-color-hue), var(--primary-color-saturation), var(--primary-color-lightness);
                --primary-color: hsl(var(--primary-color-hsl));
                --primary-color-light: hsl(var(--primary-color-hue), var(--primary-color-saturation), calc(var(--primary-color-lightness)*1.2));
                --primary-color-dark: hsl(var(--primary-color-hue), var(--primary-color-saturation), calc(var(--primary-color-lightness)*0.8));

                --secondary-color-hue: ${themeDefinition['secondary-color-hue']};
                --secondary-color-saturation: ${themeDefinition['secondary-color-saturation']};
                --secondary-color-lightness: ${themeDefinition['secondary-color-lightness']};
                --secondary-color-hsl: var(--secondary-color-hue), var(--secondary-color-saturation), var(--secondary-color-lightness);
                --secondary-color: hsl(var(--secondary-color-hsl));
                --secondary-color-light: hsl(var(--secondary-color-hue), var(--secondary-color-saturation), calc(var(--secondary-color-lightness)*1.2));
                --secondary-color-dark: hsl(var(--secondary-color-hue), var(--secondary-color-saturation), calc(var(--secondary-color-lightness)*0.8));

                --tertiary-color-hue: ${themeDefinition['tertiary-color-hue']};
                --tertiary-color-saturation: ${themeDefinition['tertiary-color-saturation']};
                --tertiary-color-lightness: ${themeDefinition['tertiary-color-lightness']};
                --tertiary-color-hsl: var(--tertiary-color-hue), var(--tertiary-color-saturation), var(--tertiary-color-lightness);
                --tertiary-color: hsl(var(--tertiary-color-hsl));
                --tertiary-color-light: hsl(var(--tertiary-color-hue), var(--tertiary-color-saturation), calc(var(--tertiary-color-lightness)*1.2));
                --tertiary-color-dark: hsl(var(--tertiary-color-hue), var(--tertiary-color-saturation), calc(var(--tertiary-color-lightness)*0.8));

                --icon-on-primary-color: ${themeDefinition['icon-on-primary-color']};

                --grey-rgb: ${themeDefinition['grey-rgb']};
                --grey-color: ${themeDefinition['grey-color']};

                --color-danger-dark: ${themeDefinition['color-danger-dark']};
                --color-success-dark: ${themeDefinition['color-success-dark']};
                --color-warning-dark: ${themeDefinition['color-warning-dark']};
                --color-info-dark: ${themeDefinition['color-info-dark']};
            }
        `;
    };

    return {
        applyDarkThemeMode,
        toggleThemeMode,
        getDefaultTheme,
        getThemeDefinition,
        getTheme,
        getThemes,
        applyTheme
    };
}

