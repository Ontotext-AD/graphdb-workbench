import {UserMenuSteps} from "../../steps/user-menu/user-menu-steps";

describe('User Menu', () => {
  it('should render user menu', () => {
    // Given I've opened a page with the user menu
    UserMenuSteps.visit();

    // And the user menu is visible
    UserMenuSteps.getUserMenu()
      .should('be.visible')
      .and('have.text', 'john.doe');

    // When, I click on the menu
    UserMenuSteps.openUserMenu();

    const dropdownOptions = ['My settings', 'Logout'];
    // Then the dropdown should be displayed and have My Settings and Logout options
    UserMenuSteps.getDropdownItems()
      .each(($item, index) => {
        cy.wrap($item).should('have.text', dropdownOptions[index]);
      });

    // When, I am logged in as external user
    UserMenuSteps.setExternalUser();

    // Then I expect to not see a logout option in the dropdown
    UserMenuSteps.getDropdownItems()
      .should('have.length', 1)
      .and('not.contain', 'Logout');
  });

  it('should redirect to the correct URL when clicking on a dropdown option', () => {
    // Given I've opened a page with the user menu
    UserMenuSteps.visit();

    // And the user menu is visible
    UserMenuSteps.getUserMenu().should('be.visible');

    // When, I click on the menu
    UserMenuSteps.openUserMenu();

    // And click on My Settings option from the dropdown, which should be the first option
    UserMenuSteps.selectDropdownItem(0)

    // Then I should be redirected to the My Settings page
    UserMenuSteps.getRedirectUrl().should('have.text', `redirect to /settings`);
    // And the dropdown should be closed
    UserMenuSteps.getDropdown().should('not.exist');
  });

  // TODO: add assertions for Logout option
});
