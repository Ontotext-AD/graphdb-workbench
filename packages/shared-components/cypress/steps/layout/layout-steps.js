import {BaseSteps} from "../base-steps";

export class LayoutSteps extends BaseSteps {
  static visit() {
    super.visit('layout');
  }

  static getLayout() {
    return cy.get('onto-layout');
  }

  static loadDefaultMenuItems() {
    return cy.get('#add-menu-items').click();
  }

  static setRole(role) {
    return cy.get(`#set-role-${role}`).click();
  }

  static setAdminRole() {
    return this.setRole('admin');
  }

  static setUserRole() {
    return this.setRole('user');
  }

  static setRepoManagerRole() {
    return this.setRole('repo-manager');
  }

  static enableSecurity() {
    return cy.get('#enable-security').click();
  }

  static disableSecurity() {
    return cy.get('#disable-security').click();
  }
}
