import HomeSteps from "../../steps/home-steps";
import {MainMenuSteps} from "../../steps/main-menu-steps";
import {LicenseSteps} from "../../steps/license-steps";
import {LicenseStubs} from "../../stubs/license-stubs";

describe('License with selected repository', () => {
    let repositoryId;

    beforeEach(() => {
        repositoryId = 'system-monitoring-init-' + Date.now();
        cy.createRepository({id: repositoryId});
        cy.presetRepository(repositoryId);
    });

    afterEach(() => {
        cy.deleteRepository(repositoryId);
    });

    it('Should display the correct initial state when navigating via URL and there is no valid license', () => {
        // Given, I visit the License page via URL with a repository selected and there is no valid license
        LicenseSteps.visit();
        // Then,
        LicenseSteps.verifyNoValidLicense();
    });

    it('Should display the correct initial state when navigating via the navigation bar and there is no valid license', () => {
        // Given, I visit the License page via the navigation menu with a repository selected and there is no valid license
        HomeSteps.visit();
        MainMenuSteps.clickOnLicense();
        // Then,
        LicenseSteps.verifyNoValidLicense();
    });

    it('Should display the correct initial state when navigating via URL and there is valid license', () => {
        LicenseStubs.stubEnterpriseLicense();
        // Given, I visit the License page via URL with a repository selected and there is valid license
        LicenseSteps.visit();
        // Then,
        LicenseSteps.verifyValidLicense();
    });

    it('Should display the correct initial state when navigating via the navigation bar and there is valid license', () => {
        LicenseStubs.stubEnterpriseLicense();
        // Given, I visit the License page via the navigation menu with a repository selected and there is valid license
        HomeSteps.visit();
        MainMenuSteps.clickOnLicense();
        // Then,
        LicenseSteps.verifyValidLicense();
    });
})
