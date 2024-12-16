import {LicenseAlertSteps} from "../../steps/license-alert/license-alert-steps";

describe('LicenseAlert', () => {
  it('Should redirect to /license, when clicked', () => {
    // Given, I visited the license-alert page
    LicenseAlertSteps.visit();

    // When, I click on the license alert
    LicenseAlertSteps.getLicenseAlert().should('be.visible').click();

    // Then, I should be redirected to /license
    LicenseAlertSteps.getRedirectUrl().should('have.text', 'redirect to /license');
  });
});
