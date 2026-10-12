import {BaseSteps} from '../base-steps';

export class UserMenuSteps extends BaseSteps {
  static visit() {
    super.visit('user-menu');
  }

  static getUserMenu() {
    return cy.get('.dropdown-toggle-wrapper');
  }

  static getDropdown() {
    return this.getUserMenu().find('.onto-user-menu-dropdown');
  }

  static setExternalUser() {
    cy.get('#update-security-config').click();
  }

  static openUserMenu() {
    return this.getUserMenu().click();
  }

  static getDropdownItems() {
    return this.getDropdown().children();
  }

  static selectDropdownItem(index) {
    this.getDropdownItems().eq(index).click();
  }

  static getToggleButton() {
    return cy.get('.onto-user-menu-toggle');
  }

  static focusToggleButton() {
    return this.getToggleButton().focus();
  }

  static getMySettingsLink() {
    return this.getDropdown().contains('a', 'My settings');
  }

  static getLogoutButton() {
    return this.getDropdown().contains('button', 'Logout');
  }
}
