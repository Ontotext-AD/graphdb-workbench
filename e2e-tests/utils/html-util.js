export class HtmlUtil {

    /**
     * Verifies that an element's content is truncated with an ellipsis by checking that
     * either the scroll width or the scroll height of the element is greater than its offset dimensions.
     * This is used to assert that the element's text is overflowing (either horizontally or vertically)
     * and is being clipped with ellipsis.
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
            expect(HtmlUtil.isOverflowing($el), 'Element should have an ellipsis (overflowing content)').to.be.true;
        });
    }

    /**
     * Verifies that an element's content is NOT truncated.
     * Checks that the scroll dimensions are equal to the offset dimensions,
     * indicating the content fits completely within the visible area.
     *
     * @param {Cypress.Chainable<JQuery<HTMLElement>>} element - The Cypress chainable element to check.
     */
    static verifyNoEllipsis(element) {
        element.should(($el) => {
            expect(HtmlUtil.isOverflowing($el), 'Element content should fit fully (no ellipsis)').to.be.false;
        });
    }

    static isOverflowing($el) {
        const el = $el[0];
        const isHorizontalOverflow = el.scrollWidth > el.offsetWidth;
        const isVerticalOverflow = el.scrollHeight > el.offsetHeight;
        return isHorizontalOverflow || isVerticalOverflow;
    }
}
