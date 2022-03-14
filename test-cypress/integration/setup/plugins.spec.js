describe('Plugins', () => {

    let repositoryId;

    function createRepository() {
        repositoryId = 'plugin-' + Date.now();
        cy.createRepository({id: repositoryId});
        cy.presetRepository(repositoryId);
        cy.initializeRepository(repositoryId);
    }

    function waitUntilPluginsPageIsLoaded() {
        // Workbench loading screen should not be visible
        cy.get('.ot-splash').should('not.be.visible');

        // No active loader
        cy.get('.ot-loader').should('not.exist');
    }

    beforeEach(() => {
        createRepository();
        cy.visit('/plugins');
        cy.window();
        waitUntilPluginsPageIsLoaded();
    });

    afterEach(() => {
        cy.visit('/plugins');
        cy.window();
        // re-enable historyplugin
        getPluginsHeader()
            .should('be.visible').parent().within(() => {
            cy.get('.switch').then((elem) => {
                var value = elem.val();
                if (!value.checked) {
                    getPluginsSwitch().click();
                }
            });
        });
        cy.deleteRepository(repositoryId);
    });

    it('should allow to enable and disable the plugins', () => {
        // Verify initial status is ON
        getPluginsHeader()
            .should('be.visible').parent().within(() => {
            cy.get('.tag-primary')
                .contains('ON');

            cy.get('.switch').should('be.checked');
            getPluginsSwitch().click();
        });
        cy.visit('/plugins');
        cy.window();

        getPluginsHeader()
            .should('be.visible').parent().within(() => {
            cy.get('.switch').should('not.be.checked');
        });
    });

    function getPluginsHeader() {
        return cy.get('.plugins-header').contains("history");
    }

    function getPluginsSwitch() {
        return cy.get('.plugins-switch');
    }
});
