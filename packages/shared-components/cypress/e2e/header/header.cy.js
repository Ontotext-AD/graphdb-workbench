import {HeaderSteps} from "../../steps/header/header-steps";
import {TooltipSteps} from "../../steps/tooltip-steps";
import {UserMenuSteps} from "../../steps/user-menu/user-menu-steps";

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
    // And I should not see the search component
    HeaderSteps.getSearch().should('not.be.visible');
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

  describe('OperationsNotification', () => {
    it('Should be shown, when there are active operations', () => {
      // Given, I visit the header page
      HeaderSteps.visit();

      // Then, I expect to not see the operations notification component
      // since, I have not selected any repository
      HeaderSteps.getOperationsNotification().should('not.exist');

      // When, I load repositories
      HeaderSteps.loadRepositories();

      // And select the first repository, so I can trigger monitoring requests
      HeaderSteps.getRepositorySelector().click();
      HeaderSteps.selectRepository(0);

      // Then, I expect to see the operations notification component
      HeaderSteps.getOperationsNotification().should('be.visible');
    });
  });

  describe('OntoUserMenu', () => {
    it('Should show/hide user menu', () => {
      // Given, I visit the header page
      HeaderSteps.visit();

      // Then, I expect to not see the user menu
      // Because I have not enabled security and haven't logged in
      UserMenuSteps.getUserMenu().should('not.exist');

      // When, I enable security
      HeaderSteps.enableSecurity();

      // Then, I expect to still not see the user menu, as I am not logged in
      UserMenuSteps.getUserMenu().should('not.exist');

      // When, I am logged in
      HeaderSteps.setAuthenticatedUser();

      // Then, I expect to see the user menu in the header, because I am both logged in and security is enabled
      UserMenuSteps.getUserMenu().should('be.visible');

      // When, I disable security
      HeaderSteps.disableSecurity();

      // Then, I expect to not see the user menu in the header
      UserMenuSteps.getUserMenu().should('not.exist');
    });
  });

  describe('RDF Search', () => {
    it('Should show/hide rdf search', () => {
      // Given, I visit the header page, and I am presumably loading the active location
      HeaderSteps.visit();
      HeaderSteps.setActiveLocationLoading();

      // Then, I expect to not see the search component and the search icon
      // As, I have not selected a repo, I don't have a repo location and isLoading is true
      HeaderSteps.getSearch().should('not.be.visible');
      // When, I select a repository
      HeaderSteps.setRepoId();
      // Then, I should still not see the search
      HeaderSteps.getSearch().should('not.be.visible');
      // When, I load the active repo location
      HeaderSteps.setRepoLocation();
      // Then, I should still not see the search, because isLoading is true
      HeaderSteps.getSearch().should('not.be.visible');


      // When, I set isLoading to false
      HeaderSteps.setActiveLocationNotLoading();
      // Then, I expect to see the search component, because I have a repo, I have a repo location and isLoading is false
      HeaderSteps.getSearch().should('be.visible');
      // And I expect the search icon to be visible
      HeaderSteps.getSearchIcon().should('be.visible');
      // And I expect the search area to not be visible yet
      HeaderSteps.getSearchArea().should('not.be.visible');
    });
  });
});
