export class TooltipSteps {

  static showLanguageSelectorDropdownToggleButtonTooltip(element) {
    element.trigger('mouseover');
  }

  static hideLanguageSelectorDropdownToggleButtonTooltip(element) {
    element.trigger('mouseleave');
  }

  static verifyTooltip(tooltipText) {
    // Then I expect to see the tooltip to be translated to the default English language.
    cy.get('.tippy-box[data-theme="onto-tooltip"]').contains(tooltipText);
  }
}
