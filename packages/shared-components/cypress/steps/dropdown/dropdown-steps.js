import {BaseSteps} from "../base-steps";

export class DropdownSteps extends BaseSteps {
  static visit() {
    super.visit('dropdown');
  }

  static getDropdown(selector = '') {
    return cy.get(`onto-dropdown${selector}`);
  }

  static openDropdown(selector = '') {
    this.getDropdown(selector).click();
  }

  static getDropdownMenu(selector = '') {
    return this.getDropdown(selector).find('.onto-dropdown-menu');
  }

  static getDropdownOptions(selector = '') {
    return this.getDropdownMenu(selector).find('.onto-dropdown-menu-item');
  }

  static hoverDropdown(selector = '') {
    this.getDropdown(selector).find('.onto-dropdown').trigger('mouseover');
  }

  static getTooltip() {
    return cy.get('[data-tippy-root]');
  }
}
