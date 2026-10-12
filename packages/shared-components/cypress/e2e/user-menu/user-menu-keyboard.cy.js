import {UserMenuSteps} from "../../steps/user-menu/user-menu-steps";

describe('User Menu keyboard access', () => {
  beforeEach(() => {
    // Given I've opened a page with the user menu
    UserMenuSteps.visit();
    UserMenuSteps.getToggleButton().should('be.visible');
  });

  it('should expose the open state of the menu', () => {
    // Then the toggle button should report that the menu is collapsed
    UserMenuSteps.getToggleButton().should('have.attr', 'aria-expanded', 'false');

    // When I open the menu with the keyboard
    UserMenuSteps.focusToggleButton();
    UserMenuSteps.pressEnter();

    // Then the toggle button should report that the menu is expanded
    UserMenuSteps.getToggleButton().should('have.attr', 'aria-expanded', 'true');
  });

  it('should open My settings with the keyboard', () => {
    // When I open the menu with the keyboard
    UserMenuSteps.focusToggleButton();
    UserMenuSteps.pressEnter();
    // And tab to My settings
    UserMenuSteps.pressTab();

    // Then My settings should be a focused link
    UserMenuSteps.getMySettingsLink()
      .should('be.focused')
      .and('have.attr', 'href', 'settings');

    // When I activate it
    UserMenuSteps.pressEnter();

    // Then I should be redirected to the My Settings page
    UserMenuSteps.verifyRedirectUrl('settings');
    // And the menu should be closed
    UserMenuSteps.getDropdown().should('not.exist');
  });

  it('should reach Logout with the keyboard', () => {
    // When I open the menu with the keyboard
    UserMenuSteps.focusToggleButton();
    UserMenuSteps.pressEnter();
    // And tab to Logout
    UserMenuSteps.pressTab();
    UserMenuSteps.pressTab();

    // Then Logout should be a focused button
    UserMenuSteps.getLogoutButton().should('be.focused');
  });

  it('should close the menu on Escape and return the focus to the toggle button', () => {
    // Given I opened the menu and moved the focus into it
    UserMenuSteps.focusToggleButton();
    UserMenuSteps.pressEnter();
    UserMenuSteps.pressTab();

    // When I press Escape
    UserMenuSteps.pressEscape();

    // Then the menu should be closed
    UserMenuSteps.getDropdown().should('not.exist');
    // And the focus should be on the toggle button
    UserMenuSteps.getToggleButton()
      .should('be.focused')
      .and('have.attr', 'aria-expanded', 'false');
  });
});
