export class BrowserStubs {
    static WINDOW_OPEN_ALIAS = (isDefinition) => {
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
}
