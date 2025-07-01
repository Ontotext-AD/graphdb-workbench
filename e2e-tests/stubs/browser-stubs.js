export class BrowserStubs {
    static WINDOW_OPEN_ALIAS = (isDefinition = false) => {
        return isDefinition ? 'windowOpen' : '@windowOpen';
    }

    static NAVIGATE_TO_URL_ALIAS = (isDefinition) => {
        return isDefinition ? 'navigateToUrl' : '@navigateToUrl';
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
     * Stubs `window.crypto.randomUUID` to return a specified UUID, because in headless mode the window cripto not exist.
     * @param uuid The UUID string to return each time `crypto.randomUUID()` is called.
     */
    static stubCryptoUUID(uuid = '999e8888-e77b-66d3-a456-426655440999') {
        cy.on('window:before:load', (win) => {
            win.crypto.randomUUID = () => uuid;
        });
    }
}
