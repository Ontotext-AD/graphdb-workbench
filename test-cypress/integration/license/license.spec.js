import {LicenseSteps} from "../../steps/license-steps";
import {LicenseStubs} from "../../stubs/license-stubs";

describe('License', () => {
   it('Should displays an informational message if the license is provided through a file (hardcoded)', () => {
      LicenseStubs.stubLicenseHardcoded(true);
      LicenseStubs.stubEnterpriseLicense();
      LicenseSteps.visit();
      LicenseSteps.getLicenseHeader().should('have.text', "GraphDB Enterprise Edition");

      LicenseSteps.getHardcodedAlertMessage().should('exist');
      LicenseSteps.getRevertToFreeLicenseButton().should('not.exist');
      LicenseSteps.getSetNewLicenseElement().should('not.exist');
   });

   it('Should not displays an informational message if the license is not provided through a file (not hardcoded)', () => {
      LicenseStubs.stubLicenseHardcoded(false);
      LicenseStubs.stubEnterpriseLicense();
      LicenseSteps.visit();
      LicenseSteps.getLicenseHeader().should('have.text', "GraphDB Enterprise Edition");

      LicenseSteps.getHardcodedAlertMessage().should('not.exist');
      LicenseSteps.getRevertToFreeLicenseButton().should('exist');
      LicenseSteps.getSetNewLicenseElement().should('exist');
   });
});
