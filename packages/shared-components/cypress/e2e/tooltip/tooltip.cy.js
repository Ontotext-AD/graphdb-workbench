import {TooltipSteps} from "../../steps/tooltip-steps";

describe('Tooltip', () => {
  it('Should handle various tooltip behaviors and styles correctly', () => {
    // Visit the page with elements that have tooltips set up.
    TooltipSteps.visit();

    // Test 1: Tooltip with plain text content.
    // When I hover over an element that displays plain text,
    TooltipSteps.getElementWithPlainTextTooltip().trigger('mouseover');
    // Then I expect the tooltip to be displayed.
    TooltipSteps.getTooltip().contains('Test plain text tooltip');
    // When the mouse is moved away from the element,
    TooltipSteps.getElementWithPlainTextTooltip().trigger('mouseout');
    // Then I expect the tooltip to be hidden.
    TooltipSteps.getTooltip().should('not.exist');

    // Test 2: Tooltip with HTML content.
    // When I hover over an element that displays HTML content,
    TooltipSteps.getElementWithHtmlTooltip().trigger('mouseover');
    // Then I expect the tooltip to be displayed.
    TooltipSteps.getHeaderOfHtmlTooltip().contains('Header');
    TooltipSteps.getBodyOfHtmlTooltip().contains('Body');
    TooltipSteps.getElementWithHtmlTooltip().trigger('mouseout');

    // Test 3: Tooltip with different placements.
    // When I hover over an element that displays a tooltip on the right,
    TooltipSteps.getElementWithRightTooltip().trigger('mouseover');
    // Then I expect the tooltip to be displayed on the right.
    TooltipSteps.verifyRightTooltipPlacement();
    TooltipSteps.getElementWithRightTooltip().trigger('mouseout');
    // When I hover over an element that displays a tooltip on the bottom,
    TooltipSteps.getElementWithBottomTooltip().trigger('mouseover');
    // Then I expect the tooltip to be displayed on the bottom.
    TooltipSteps.verifyBottomTooltipPlacement();
    TooltipSteps.getElementWithBottomTooltip().trigger('mouseout');

    // Test 4: Tooltips with different themes.
    // When I hover over an element that displays a tooltip with the default theme,
    TooltipSteps.getElementWithDefaultThemeTooltip().trigger('mouseover');
    // Then I expect the tooltip to be colored according to the default theme.
    TooltipSteps.getTooltip().should('have.css', 'background-color', 'rgb(0, 54, 99)');
    TooltipSteps.getElementWithDefaultThemeTooltip().trigger('mouseout');
    // When I hover over an element that displays a tooltip with a custom theme,
    TooltipSteps.getElementWithCustomThemeTooltip().trigger('mouseover');
    // Then I expect the tooltip to be colored according to the custom theme.
    TooltipSteps.getTooltip('custom-theme').should('have.css', 'background-color', 'rgb(252, 255, 205)');
  });

  it('Should remove tooltip, when the element is removed from the DOM', () => {
    // Given, I visit the page with an element that has a tooltip
    TooltipSteps.visit();

    // When, I hover over the removable element
    TooltipSteps.hoverOnRemovableButton();

    // Then, I expect the tooltip to be visible
    TooltipSteps.getTooltipContent()
      .should('be.visible')
      .and('contain', 'Remove me');

    // When, I remove the element from the DOM
    TooltipSteps.clickOnRemovableButton();

    // Then, I expect the tooltip to be removed along with the element
    TooltipSteps.getTooltip().should('not.exist');
  });


  it('Should remove tooltip from the DOM, when hideTooltip is called on element with tooltip', () => {
    // Given, I visit the page with an element that has a tooltip
    TooltipSteps.visit();

    // When, I hover over an element with a tooltip
    TooltipSteps.getButtonElementTooltip().trigger('mouseover');

    // Then, I expect the tooltip to be visible
    TooltipSteps.getTooltip().should('be.visible');

    // When, I call hideTooltip on the element
    TooltipSteps.getButtonElementTooltip()
      .then(($el) => {
        const element = $el.get(0);
        element.hideTooltip();
      })

    // Then, I expect the tooltip to be removed
    TooltipSteps.getTooltip().should('not.exist');
  });
});
