import {HeaderSteps} from "../../steps/header/header-steps";
import {TooltipSteps} from "../../steps/tooltip-steps";

describe('Header', () => {
  it('Should render header and various tools inside', () => {
    // Given I visit the header page
    HeaderSteps.visit();
    // Then I should see the header
    HeaderSteps.getHeader().should('be.visible');
    // And I should see the language selector
    HeaderSteps.getLanguageSelector().should('be.visible');
    // And I should see the repository selector
    HeaderSteps.getRepositorySelector().should('be.visible');
    // And I should see the search component
    HeaderSteps.getSearch().should('be.visible');
  });

  describe('OntoLicenseAlert', () => {
    it('Should be visible when license is invalid', () => {
      // Given, I visit the header page
      HeaderSteps.visit();

      // When, I have an invalid license
      HeaderSteps.setLicenseValid(false);

      // Then, the license alert should be visible
      HeaderSteps.getLicenseAlert().should('be.visible');

      // When, I hover over the notification
      HeaderSteps.getLicenseAlert().trigger('mouseover');

      // Then, I should see a tooltip
      TooltipSteps.getTooltip().should('be.visible');

      // And the tooltip should contain the expected message
      TooltipSteps.getTooltipContent().should('have.text', 'Invalid license');

      // When, I move the mouse away
      HeaderSteps.getLicenseAlert().trigger('mouseout');

      // Then the tooltip should disappear
      TooltipSteps.getTooltip().should('not.exist');
    });

    it('Should be hidden when license is valid', () => {
      // Given, I visit the header page
      HeaderSteps.visit();

      // When, I have a valid license
      HeaderSteps.setLicenseValid(true);

      // Then, the license alert should be hidden
      HeaderSteps.getLicenseAlert().should('not.exist');
    });
  });
});
