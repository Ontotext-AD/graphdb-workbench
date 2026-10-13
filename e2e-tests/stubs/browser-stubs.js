export class BrowserStubs {
    static WINDOW_OPEN_ALIAS = (isDefinition = false) => {
        return isDefinition ? 'windowOpen' : '@windowOpen';
    }

    static NAVIGATE_TO_URL_ALIAS = (isDefinition) => {
        return isDefinition ? 'navigateToUrl' : '@navigateToUrl';
    }

    static LINK_CLICKS_ALIAS = (isDefinition = false) => {
        return isDefinition ? 'linkClicks' : '@linkClicks';
    }

    static stubWindowOpen() {
        cy.window().then((win) => {
            cy.stub(win, 'open').as(BrowserStubs.WINDOW_OPEN_ALIAS(true))
        })
    }

    static spyNavigateToUrl() {
        cy.window().then((win) => {
            cy.spy(win.singleSpa, 'navigateToUrl').as(BrowserStubs.NAVIGATE_TO_URL_ALIAS(true))
        })
    }

    /**
     * Checks what the browser would do with a clicked link, without following it.
     *
     * Use it for plain links (`<a href target="_blank">`) that the browser opens by itself. Such links do not call
     * `window.open`, so {@link stubWindowOpen} cannot see them, and Cypress cannot follow a new window.
     *
     * For every clicked link it records:
     * - `href`: the link address;
     * - `target`: the link target, `_blank` for a new window;
     * - `defaultPrevented`: `true` when the page handled the click itself, for example to navigate in the same window.
     *   The browser opens the link only when this is `false`.
     *
     * Then it stops the click, so the test stays on the same page.
     *
     * @example
     * BrowserStubs.captureLinkClicks();
     * cy.get('a.my-link').click();
     * // The browser would open "cluster" in a new window.
     * cy.get(BrowserStubs.LINK_CLICKS_ALIAS())
     *     .should('deep.equal', [{href: 'cluster', target: '_blank', defaultPrevented: false}]);
     */
    static captureLinkClicks() {
        cy.window().then((win) => {
            const clicks = [];
            win.document.addEventListener('click', (event) => {
                const link = event.target.closest('a');
                if (!link) {
                    return;
                }
                clicks.push({href: link.getAttribute('href'), target: link.target, defaultPrevented: event.defaultPrevented});
                event.preventDefault();
            });
            cy.wrap(clicks).as(BrowserStubs.LINK_CLICKS_ALIAS(true));
        });
    }
}
