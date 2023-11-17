const modules = [];

angular
    .module('graphdb.framework.core.services.theme-service', modules)
    .factory('ThemeService', ThemeService);

ThemeService.$inject = ['WorkbenchSettingsStorageService', '$translate', 'toastr'];

const THEMES_EXTENSION = 'themes';
const DEFAULT_THEME_NAME = 'default-theme';
const DARK_MODE = 'dark';
const ThemeDefinitionModel = {
    'name': null,
    'label': null,
    'variables': {
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
        'gray-color': null,
        'color-danger-dark': null,
        'color-success-dark': null,
        'color-warning-dark': null,
        'color-info-dark': null,
        'color-danger-light': null,
        'color-success-light': null,
        'color-warning-light': null,
        'color-info-light': null,
        'color-help-light': null,
        'logo-color': null,
        'logo-text-color': null,
        'logo-background-color': null
    }
};

function ThemeService(workbenchSettingsStorageService, $translate, toastr) {

    /**
     * Applies the dark theme mode if it's saved in the local storage with the workbench settings. Otherwise the dark
     * mode is not applied.
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
     * @return {ThemeModel} The default theme names and labels.
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
     * @return {ThemeDefinitionModel|undefined} A theme definition obtained from the PluginRegistry by name.
     */
    const getThemeDefinitionByName = (themeName) => {
        const themeDefinition = PluginRegistry.findPlugin(THEMES_EXTENSION, (themeDefinition) => themeDefinition.name === themeName);
        if (themeDefinition) {
            return themeDefinition;
        } else if (themeName !== DEFAULT_THEME_NAME) {
            // Theme not existing: not present in settings or no longer part of GraphDB,
            // fallback to the default theme
            return getDefaultThemeDefinition();
        }
    };

    /**
     * @return {ThemeDefinitionModel|undefined} The registered default theme definition obtained from the PluginRegistry.
     */
    const getDefaultThemeDefinition = () => {
      return getThemeDefinitionByName(DEFAULT_THEME_NAME);
    };

    /**
     * @return {Object|undefined} The selected theme definition saved in the local storage obtained from the
     * PluginRegistry.
     */
    const getSelectedThemeDefinition = () => {
        const workbenchTheme = workbenchSettingsStorageService.getThemeName();
        return getThemeDefinitionByName(workbenchTheme);
    };

    /**
     * @return {ThemeModel} The selected theme or the default theme name and label.
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
     * @return {ThemeModel[]} An array with all registered theme names and labels.
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
     * @param {ThemeDefinitionModel} themeDefinition
     * @return {boolean}
     */
    const validateThemeDefinition = (themeDefinition) => {
        function validate(model, value, path, validationResult) {
            Object.keys(model).forEach((prop) => {
                if (!(prop in value)) {
                    validationResult.push(path + prop);
                } else {
                    if (angular.isObject(model[prop])) {
                        validate(model[prop], value[prop], path + prop + '.', validationResult);
                    }
                }
            });
            return validationResult;
        }

        const validationResult = validate(ThemeDefinitionModel, themeDefinition, '', []);
        if (validationResult.length) {
            toastr.error($translate.instant('security.workbench.settings.theme.validation.missing-fields'));
            console.error(`
            Color theme validation error. Missing definitions in plugin theme: ${validationResult.join(', ')}.
            Check the developers guide how to create a valid color theme.`);
            return false;
        }
        return true;
    };

    /**
     * Gets a theme definition. If there is a saved theme, then theme definition with that name loaded from
     * PluginRegistry and returned. Otherwise the default theme definition is returned.
     * @return {ThemeDefinitionModel}
     */
    const getThemeDefinition = () => {
        const workbenchTheme = workbenchSettingsStorageService.getThemeName();
        let selectedThemeDefinition = PluginRegistry.findPlugin(THEMES_EXTENSION, (themeDefinition) => themeDefinition.name === workbenchTheme);
        if (!selectedThemeDefinition) {
            selectedThemeDefinition = getDefaultThemeDefinition();
        }
        return selectedThemeDefinition;
    };

    /**
     * Builds a stylesheet model using the theme definition.
     * @param {ThemeDefinitionModel} themeDefinition
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

    /**
     * @param {ThemeDefinitionModel} themeDefinition
     * @return {string}
     */
    const themeTag = (themeDefinition) => {
        function setDefaultValue(color, key, value) {
            if (!color[key]) {
                color[key] = value;
            }
        }

        function mapToCss(map) {
            return Object.entries(map).map((entry) => {
                return entry[0] + ': ' + entry[1] + ';';
            }).join("\n");
        }

        function themeToCss(themeDefinition, addDefaults=true) {
            const css = {};
            for (const [key, value] of Object.entries(themeDefinition['variables'])) {
                css['--' + key] = value;
            }
            if ('properties' in themeDefinition) {
                for (const [key, value] of Object.entries(themeDefinition['properties'])) {
                    css[key] = value;
                }
            }
            if (addDefaults) {
                // These definitions may be overridden in a theme definition but they have sane defaults
                for (const name of ['primary', 'secondary', 'tertiary']) {
                    setDefaultValue(css, `--${name}-color-hsl`,
                        `var(--${name}-color-hue), var(--${name}-color-saturation), var(--${name}-color-lightness)`);
                    setDefaultValue(css, `--${name}-color`, `hsl(var(--${name}-color-hsl))`);
                    setDefaultValue(css, `--${name}-color-light`,
                        `hsl(var(--${name}-color-hue), var(--${name}-color-saturation), calc(var(--${name}-color-lightness)*1.2))`);
                    setDefaultValue(css, `--${name}-color-dark`,
                        `hsl(var(--${name}-color-hue), var(--${name}-color-saturation), calc(var(--${name}-color-lightness)*0.8))`);
                }
            }

            return mapToCss(css);
        }

        const darkTheme = themeDefinition['dark'];

        return `
            :root {
                ${themeToCss(themeDefinition)}
            }

            :root.dark {
                ${darkTheme ? themeToCss(darkTheme, false) : ''}
            }
        `;
    };

    const getPrimaryColorAsString = () => {
        const themeDefinition = getThemeDefinition();
        const hue = themeDefinition.variables['primary-color-hue'];
        const lightness = themeDefinition.variables['primary-color-lightness'];
        const saturation = themeDefinition.variables['primary-color-saturation'];
        return `hsl(${hue}, ${saturation}, ${lightness})`;
    }

    const getSecondaryColorAsString = () => {
        const themeDefinition = getThemeDefinition();
        const hue = themeDefinition.variables['secondary-color-hue'];
        const lightness = themeDefinition.variables['secondary-color-lightness'];
        const saturation = themeDefinition.variables['secondary-color-saturation'];
        return `hsl(${hue}, ${saturation}, ${lightness})`;
    }
    const getTertiaryColorAsString = () => {
        const themeDefinition = getThemeDefinition();
        const hue = themeDefinition.variables['tertiary-color-hue'];
        const lightness = themeDefinition.variables['tertiary-color-lightness'];
        const saturation = themeDefinition.variables['tertiary-color-saturation'];
        return `hsl(${hue}, ${saturation}, ${lightness})`;
    }

    return {
        applyDarkThemeMode,
        toggleThemeMode,
        getDefaultTheme,
        getThemeDefinition,
        getTheme,
        getThemes,
        applyTheme,
        getPrimaryColorAsString,
        getSecondaryColorAsString,
        getTertiaryColorAsString
    };
}

