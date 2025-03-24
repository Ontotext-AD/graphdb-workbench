import {BaseSteps} from "../base-steps";

export class UserMenuSteps extends BaseSteps {
  static visit() {
    super.visit('user-menu');
  }

  static getUserMenu() {
    return cy.get('.onto-user-menu');
  }

  static getDropdown() {
    return this.getUserMenu().find('.onto-user-menu-dropdown');
  }

  static setExternalUser() {
    cy.get('#set-external-user').click();
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
}
