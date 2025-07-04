import {BaseSteps} from "../base-steps";

export class NavbarSteps extends BaseSteps {
  static visit() {
    super.visit('navbar');
  }

  static toggleNavbar() {
    cy.get('.toggle-menu').click();
  }

  static getMainMenu() {
    return cy.get('.navbar-component');
  }

  static getRootMenuItems() {
    return cy.get('.navbar-component > .menu-element');
  }

  static getRootMenuItem(index) {
    return this.getRootMenuItems().eq(index);
  }

  static openSubmenus(index) {
    this.getRootMenuItem(index).find('.menu-element-root').click();
  }

  static closeSubmenus(index) {
    this.getRootMenuItem(index).find('.menu-element-root').click();
  }

  static getSubmenuItems(index) {
    return this.getRootMenuItem(index).find('.sub-menu > .sub-menu-item');
  }
}
