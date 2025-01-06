import {BaseSteps} from "../base-steps";

export class PermissionBannerSteps extends BaseSteps{
  static visit() {
    super.visit('permission-banner');
  }

  static getPermissionBanner() {
    return cy.get('.permission-banner');
  }

  static getMainContainer() {
    return this.getPermissionBanner().find('.permission-banner-content');
  }

  static getAlertText() {
    return this.getPermissionBanner().find('.label-container');
  }

  static getTranslationLabelElement() {
    return cy.root().find('translate-label').shadow().eq(1);
  }
}
