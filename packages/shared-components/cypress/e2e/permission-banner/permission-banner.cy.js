import {PermissionBannerSteps} from "../../steps/permission-banner/permission-banner-steps";

describe('onto-permission-banner', () => {
  beforeEach(() => {
    // Given I visit the page where the component is rendered
    PermissionBannerSteps.visit()
  });

  it('should render the component with the correct structure', () => {
    // Then I expect the component exists
    PermissionBannerSteps.getPermissionBanner().should('exist');
    PermissionBannerSteps.getMainContainer().should('exist');

    // And the alert message structure should be correct
    PermissionBannerSteps.getAlertText()
      .within(() => {
        PermissionBannerSteps.getTranslationLabelElement()
          .should('have.text', 'Please choose another menu item or login as a different user.');
      });
  });
});
