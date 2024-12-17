import { TooltipSteps } from "../../steps/tooltip-steps";

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
});
