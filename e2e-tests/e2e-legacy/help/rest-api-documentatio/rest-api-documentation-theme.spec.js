import {RestApiDocumentationSteps} from "../../../steps/rest-api-documentation-steps";

describe('REST API Documentation theme', () => {
    const THEME_PERSISTENCE_KEY = 'ls.workbench-settings';

    // Queued with cy.then, so the change happens in command order and not when the test body runs.
    const emulateMediaFeatures = (features) => cy.then(() => Cypress.automation('remote:debugger:protocol', {
        command: 'Emulation.setEmulatedMedia',
        params: {features}
    }));
    const emulateOsColorScheme = (colorScheme) => emulateMediaFeatures([{name: 'prefers-color-scheme', value: colorScheme}]);

    afterEach(() => {
        emulateMediaFeatures([]);
    });

    it('should use the Swagger UI light theme when the workbench is in light mode', () => {
        // Given, the light theme is persisted in local storage
        cy.setLocalStorage(THEME_PERSISTENCE_KEY, JSON.stringify({"theme": "default-theme", "mode": "light"}));
        // When, I visit the REST API Documentation page
        RestApiDocumentationSteps.visit();
        // Then, Swagger UI uses its light theme
        RestApiDocumentationSteps.verifySwaggerLightTheme();
    });

    it('should use the Swagger UI dark theme when the workbench is in dark mode', () => {
        // Given, the dark theme is persisted in local storage
        cy.setLocalStorage(THEME_PERSISTENCE_KEY, JSON.stringify({"theme": "default-theme", "mode": "dark"}));
        // When, I visit the REST API Documentation page
        RestApiDocumentationSteps.visit();
        // Then, Swagger UI uses its dark theme
        RestApiDocumentationSteps.verifySwaggerDarkTheme();
    });

    it('should switch the Swagger UI theme when the OS color scheme changes and the workbench follows the OS', () => {
        // Given, no theme is persisted, so the workbench follows the OS, and the OS is in light mode
        emulateOsColorScheme('light');
        // And, I have opened the REST API Documentation page
        RestApiDocumentationSteps.visit();
        RestApiDocumentationSteps.verifySwaggerLightTheme();
        // When, the OS switches to dark mode
        emulateOsColorScheme('dark');
        // Then, Swagger UI switches to its dark theme
        RestApiDocumentationSteps.verifySwaggerDarkTheme();
        // When, the OS switches back to light mode
        emulateOsColorScheme('light');
        // Then, Swagger UI switches back to its light theme
        RestApiDocumentationSteps.verifySwaggerLightTheme();
    });
});
