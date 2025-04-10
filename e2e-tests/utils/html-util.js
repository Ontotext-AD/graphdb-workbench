export class HtmlUtil {

    /**
     * Verifies that an element's content is truncated with an ellipsis by checking that
     * the scroll width of the element is greater than its offset width.
     * This is used to assert that the element's text is overflowing and is being clipped with ellipsis.
     *
     * @param {Cypress.Chainable<JQuery<HTMLElement>>} element - The Cypress chainable element to check.
     * @throws {AssertionError} If the element's content is not truncated with ellipsis.
     *
     * @example
     * // Example usage in a test
     * HtmlUtil.verifyEllipsis(cy.get('.node-wrapper'));
     */
    static verifyEllipsis(element) {
        element.should(($el) => {
            const el = $el[0];
            expect(el.scrollWidth).to.be.greaterThan(el.offsetWidth);
        });
    }
}
