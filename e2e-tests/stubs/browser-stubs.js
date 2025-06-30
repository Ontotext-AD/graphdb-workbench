export class BrowserStubs {
    static WINDOW_OPEN_ALIAS = (isDefinition) => {
        return isDefinition ? 'windowOpen' : '@windowOpen';
    }

    static stubWindowOpen() {
        cy.window().then((win) => {
            cy.stub(win, 'open').as(BrowserStubs.WINDOW_OPEN_ALIAS(true))
        })
    }
}
