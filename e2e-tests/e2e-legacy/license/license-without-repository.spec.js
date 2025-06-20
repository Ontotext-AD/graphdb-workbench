import HomeSteps from "../../steps/home-steps";
import {MainMenuSteps} from "../../steps/main-menu-steps";
import {LicenseSteps} from "../../steps/license-steps";
import {LicenseStubs} from "../../stubs/license-stubs";

describe('License without selected repository', () => {

    it('Should display the correct initial state when navigating via URL and there is no license', () => {
        LicenseStubs.stubLicenseHardcoded(false)
        LicenseStubs.stubLicenseNotSet();
        // Given, I visit the License page via URL without a repository selected and there is no license
        LicenseSteps.visit();
        // Then,
        LicenseSteps.verifyLicenseNotSet();
    });

    it('Should display the correct initial state when navigating via the navigation menu and there is no license', () => {
        LicenseStubs.stubLicenseHardcoded(false)
        LicenseStubs.stubLicenseNotSet();
        // Given, I visit the License page via the navigation menu without a repository selected and there is no license
        HomeSteps.visit();
        MainMenuSteps.clickOnLicense();
        // Then,
        LicenseSteps.verifyLicenseNotSet();
    });

    it('Should display the correct initial state when navigating via URL and there is no valid license', () => {
        LicenseStubs.stubLicenseHardcoded(false);
        LicenseStubs.stubNoValidLicense();
        // Given, I visit the License page via URL without a repository selected and there is no valid license
        LicenseSteps.visit();
        // Then,
        LicenseSteps.verifyNoValidLicense();
    });

    it('Should display the correct initial state when navigating via the navigation menu and there is no valid license', () => {
        LicenseStubs.stubLicenseHardcoded(false);
        LicenseStubs.stubNoValidLicense();
        // Given, I visit the License page via the navigation menu without a repository selected and there is no valid license
        HomeSteps.visit();
        MainMenuSteps.clickOnLicense();
        // Then,
        LicenseSteps.verifyNoValidLicense();
    });

    it('Should display the correct initial state when navigating via URL and there is no valid hardcoded license', () => {
        LicenseStubs.stubLicenseHardcoded(true);
        LicenseStubs.stubNoValidLicense();
        // Given, I visit the License page via URL without a repository selected and there is no valid hardcoded license
        LicenseSteps.visit();
        // Then,
        LicenseSteps.verifyNoValidLicenseHardcoded();
    });

    it('Should display the correct initial state when navigating via the navigation menu and there is no valid hardcoded license', () => {
        LicenseStubs.stubLicenseHardcoded(true);
        LicenseStubs.stubNoValidLicense();
        // Given, I visit the License page via the navigation menu without a repository selected and there is no valid hardcoded license
        HomeSteps.visit();
        MainMenuSteps.clickOnLicense();
        // Then,
        LicenseSteps.verifyNoValidLicenseHardcoded();
    });

    it('Should display the correct initial state when navigating via URL and there is valid license', () => {
        LicenseStubs.stubLicenseHardcoded(false);
        LicenseStubs.stubEnterpriseLicense();
        // Given, I visit the License page via URL without a repository selected and there is valid license
        LicenseSteps.visit();
        // Then,
        LicenseSteps.verifyValidLicense();
    });

    it('Should display the correct initial state when navigating via the navigation menu and there is valid license', () => {
        LicenseStubs.stubLicenseHardcoded(false);
        LicenseStubs.stubEnterpriseLicense();
        // Given, I visit the License page via the navigation menu without a repository selected and there is valid license
        HomeSteps.visit();
        MainMenuSteps.clickOnLicense();
        // Then,
        LicenseSteps.verifyValidLicense();
    });


    it('Should display the correct initial state when navigating via URL and there is valid hardcoded license', () => {
        LicenseStubs.stubLicenseHardcoded(true);
        LicenseStubs.stubEnterpriseLicense();
        // Given, I visit the License page via URL without a repository selected and there is valid hardcoded license
        LicenseSteps.visit();
        // Then,
        LicenseSteps.verifyValidLicenseHardcoded();
    });

    it('Should display the correct initial state when navigating via the navigation menu and there is valid harcoded license', () => {
        LicenseStubs.stubLicenseHardcoded(true);
        LicenseStubs.stubEnterpriseLicense();
        // Given, I visit the License page via the navigation menu without a repository selected and there is valid hardcoded license
        HomeSteps.visit();
        MainMenuSteps.clickOnLicense();
        // Then,
        LicenseSteps.verifyValidLicenseHardcoded();
    });
})
