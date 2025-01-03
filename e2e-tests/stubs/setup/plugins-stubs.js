export class PluginsStubs {
    static spyPluginsGet(repositoryId) {
        cy.intercept('GET', `/repositories/${repositoryId}?query=**`).as('get-plugins');
    }
}
