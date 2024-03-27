describe.skip('Help / REST API', () => {

    before(() => {
        // Disables the security (only for this spec) to be able to interact with Swagger's iframe
        // See https://github.com/cypress-io/cypress/issues/136
        Cypress.config({chromeWebSecurity: false});
    });

    beforeEach(() => {
        cy.visit('/webapi');
        cy.window();
        getSwaggerFrame()
            .find('#message-bar')
            .should('be.visible');
    });

    // TODO: Check explicitly for all controllers (name + summary) ?

    it('should provide documentation and examples for GraphDB APIs', () => {
        // The GraphDB API section should list the available controllers & each controller should have a heading and possible options
        verifyControllerList(getGraphDBAPI());

        // All controllers should be collapsed
        verifyControllerListIsCollapsed(getGraphDBAPI());

        // Examine the import controller
        verifyControllerOptions('import-controller', 'Data import');
    });

    it('should provide documentation and examples for RDF4J APIs', () => {
        // The RDF4J API section should list the available controllers & each controller should have a heading and possible options
        verifyControllerList(getRDF4JAPI());

        // All controllers should be collapsed
        verifyControllerListIsCollapsed(getRDF4JAPI());

        // Examine the import controller
        verifyControllerOptions('repository-management-controller', 'Repository management');
    });

    function getSwaggerFrame() {
        return cy.get('#webapi_frame').iframe();
    }

    function getGraphDBAPI() {
        return getSwaggerFrame().find('#swagger-ui-container-graphdb');
    }

    function getRDF4JAPI() {
        return getSwaggerFrame().find('#swagger-ui-container-rdf4j');
    }

    function getGraphDBController(id) {
        return getGraphDBAPI().find('.resource .heading').contains(id).parentsUntil('#resources').last();
    }

    function verifyControllerList(controllerSection) {
        controllerSection.within(($section) => {
            cy.wrap($section)
                .should('be.visible')
                .find('.resource')
                .should('be.visible')
                .its('length')
                .should('be.gt', 0)

                // Go back to the section
                .root()
                .find('.resource > .heading')
                .should('be.visible')
                .find('.options')
                .should('be.visible')
                .find('.toggleEndpointList')
                .should('be.visible')
                .and('not.be.disabled');
        });
    }

    function verifyControllerListIsCollapsed(controllerSection) {
        controllerSection
            .find('.resource .endpoints')
            .should('not.be.visible');
    }

    function verifyControllerOptions(id, summary) {
        getGraphDBController(id)
            .should('be.visible')
            .within(() => {
                // Should have a heading text
                // Note: selecting the first heading, otherwise it will select each endpoint heading too
                cy.get('> .heading')
                    .should('contain', summary)

                    // Should allow certain operations from the heading
                    .find('.options')
                    .should('be.visible')
                    .find('li')
                    // Make sure we have selected only the controller options
                    .should('have.length', 3)
                    .and('contain', 'Show/Hide')
                    .and('contain', 'List Operations')
                    .and('contain', 'Expand Operations')

                    // Expand the available endpoints and methods, should list their headings and options
                    .find('.collapseResource')
                    .click();

                cy.get('.endpoints .heading').within(() => {
                    cy.get('.path').should('be.visible');
                    cy.get('.options').should('be.visible');
                });
                // Should not show examples, only paths & options
                cy.get('.endpoints .content').should('not.be.visible');

                // Expand all operations for the import controller
                cy.get('> .heading .options .expandResource').click();
                // For each endpoint there should be an example along with the path heading
                cy.get('.endpoints .heading .path').should('be.visible');
                cy.get('.endpoints .content').should('be.visible');
            });
    }
});
