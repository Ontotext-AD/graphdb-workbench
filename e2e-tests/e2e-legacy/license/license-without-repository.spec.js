import HomeSteps from "../../steps/home-steps";
import {MainMenuSteps} from "../../steps/main-menu-steps";
import {LicenseSteps} from "../../steps/license-steps";
import {LicenseStubs} from "../../stubs/license-stubs";

describe('License without selected repository', () => {
    it('Should display the correct initial state when navigating via URL and there is no valid license', () => {
        // Given, I visit the License page via URL without a repository selected and there is no valid license
        LicenseSteps.visit();
        // Then,
        LicenseSteps.verifyNoValidLicense();
    });

    it('Should display the correct initial state when navigating via the navigation menu and there is no valid license', () => {
        // Given, I visit the License page via the navigation menu without a repository selected and there is no valid license
        HomeSteps.visit();
        MainMenuSteps.clickOnLicense();
        // Then,
        LicenseSteps.verifyNoValidLicense();
    });

    it('Should display the correct initial state when navigating via URL and there is valid license', () => {
        LicenseStubs.stubEnterpriseLicense();
        // Given, I visit the License page via URL without a repository selected and there is valid license
        LicenseSteps.visit();
        // Then,
        LicenseSteps.verifyValidLicense();
    });

    it('Should display the correct initial state when navigating via the navigation menu and there is valid license', () => {
        LicenseStubs.stubEnterpriseLicense();
        // Given, I visit the License page via the navigation menu without a repository selected and there is valid license
        HomeSteps.visit();
        MainMenuSteps.clickOnLicense();
        // Then,
        LicenseSteps.verifyValidLicense();
    });
})
