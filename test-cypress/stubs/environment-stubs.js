export class EnvironmentStubs {
    static stubWbProdMode() {
        cy.window().then((win) => {
            win.wbDevMode = false;
        });
    }
}
