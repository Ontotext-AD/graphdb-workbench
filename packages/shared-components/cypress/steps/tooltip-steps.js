import {BaseSteps} from "./base-steps";

export class TooltipSteps extends BaseSteps {

  static visit() {
    super.visit('tooltip');
  }

  static getTooltip(theme = 'onto-tooltip') {
    return cy.get(`.tippy-box[data-theme="${theme}"]`);
  }

  static getElementWithPlainTextTooltip() {
    return cy.get('.plane-text-tooltip');
  }

  static getElementWithHtmlTooltip() {
    return cy.get('.html-tooltip');
  }

  static getHeaderOfHtmlTooltip() {
    return TooltipSteps.getTooltip().find('.header');
  }

  static getBodyOfHtmlTooltip() {
    return TooltipSteps.getTooltip().find('.body');
  }

  static getTooltipContent() {
    return TooltipSteps.getTooltip().find('.tippy-content');
  }

  static getElementWithBottomTooltip() {
    return cy.get('.tooltip-bottom');
  }

  static getElementWithRightTooltip() {
    return cy.get('.tooltip-right');
  }

  static getElementWithDefaultThemeTooltip() {
    return cy.get('.tooltip-default-theme');
  }

  static getElementWithCustomThemeTooltip() {
    return cy.get('.tooltip-custom-theme');
  }

  static verifyRightTooltipPlacement() {
    TooltipSteps.getTooltip().should('have.attr', 'data-placement', 'right')
  }

  static verifyBottomTooltipPlacement() {
    TooltipSteps.getTooltip().should('have.attr', 'data-placement', 'bottom')
  }
}
