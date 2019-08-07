describe('Main menu tests', function () {

    beforeEach(function () {
        cy.visit('');
    });

    it('Main menu components validation', function () {

        cy.get('.main-menu')
            .contains('Import').and('be.hidden');
        cy.get('.sub-menu')
            .contains('RDF').and('be.hidden');
        cy.get('.sub-menu')
            .contains('Tabular (OntoRefine)').and('be.hidden');

        cy.get('.main-menu')
            .contains('Explore').and('be.hidden');
        cy.get('.sub-menu')
            .contains('Graphs overview').and('be.hidden');
        cy.get('.sub-menu')
            .contains('Class hierarchy').and('be.hidden');
        cy.get('.sub-menu')
            .contains('Class relationships').and('be.hidden');
        cy.get('.sub-menu')
            .contains('Visual graph').and('be.hidden');

        cy.get('.main-menu')
            .contains('SPARQL').and('be.visible');

        cy.get('.main-menu')
            .contains('Setup').and('be.hidden');
        cy.get('.sub-menu')
            .contains('Repositories').and('be.hidden');
        cy.get('.sub-menu')
            .contains('Users and Access').and('be.hidden');
        cy.get('.sub-menu')
            .contains('My Settings').and('be.hidden');
        cy.get('.sub-menu')
            .contains('Connectors').and('be.hidden');
        cy.get('.sub-menu')
            .contains('Namespaces').and('be.hidden');
        cy.get('.sub-menu')
            .contains('Autocomplete').and('be.hidden');
        cy.get('.sub-menu')
            .contains('RDF Rank').and('be.hidden');

        cy.get('.main-menu')
            .contains('Help').and('be.hidden');
        cy.get('.sub-menu')
            .contains('REST API').and('be.hidden');
        cy.get('.sub-menu')
            .contains('Documentation').and('be.hidden');
        cy.get('.sub-menu')
            .contains('Developer Hub').and('be.hidden');
        cy.get('.sub-menu')
            .contains('Support').and('be.hidden');
        cy.get('.sub-menu')
            .contains('System information').and('be.hidden');
    });


    it('Main menu components redirection', function () {

        cy.get('.main-menu')
            .contains('Import')
            .click({force: true});
        cy.get('.sub-menu')
            .contains('RDF')
            .click({force: true})
            .url()
            .should('contains', '/import');
        cy.get('.sub-menu')
            .contains('Tabular (OntoRefine)')
            .click({force: true})
            .url()
            .should('contains', '/ontorefine');

        cy.get('.main-menu')
            .contains('Explore')
            .click({force: true});
        cy.get('.sub-menu')
            .contains('Graphs overview')
            .click({force: true})
            .url()
            .should('include', '/graphs');
        cy.get('.sub-menu')
            .contains('Class hierarchy')
            .click({force: true})
            .url()
            .should('include', '/hierarchy');
        cy.get('.sub-menu')
            .contains('Class hierarchy')
            .click({force: true})
            .url()
            .should('include', '/hierarchy');
        cy.get('.sub-menu')
            .contains('Class relationships')
            .click({force: true})
            .url()
            .should('include', '/relationships');
        cy.get('.sub-menu')
            .contains('Visual graph')
            .click({force: true})
            .url()
            .should('include', '/graphs-visualizations');

        cy.get('.main-menu')
            .contains('SPARQL')
            .click()
            .url()
            .should('include', '/sparql');

        cy.get('.main-menu')
            .contains('Setup')
            .click({force: true});
        cy.get('.sub-menu')
            .contains('Repositories')
            .click({force: true})
            .url()
            .should('include', '/repository');
        cy.get('.sub-menu')
            .contains('Users and Access')
            .click({force: true})
            .url()
            .should('include', '/users');
        cy.get('.sub-menu')
            .contains('My Settings')
            .click({force: true})
            .url()
            .should('include', '/settings');
        cy.get('.sub-menu')
            .contains('Connectors')
            .click({force: true})
            .url()
            .should('include', '/connectors');
        cy.get('.sub-menu')
            .contains('Namespaces')
            .click({force: true})
            .url()
            .should('include', '/namespaces');
        cy.get('.sub-menu')
            .contains('Autocomplete')
            .click({force: true})
            .url()
            .should('include', '/autocomplete');
        cy.get('.sub-menu')
            .contains('RDF Rank')
            .click({force: true})
            .url()
            .should('include', '/rdfrank');

        cy.get('.main-menu')
            .contains('Help')
            .click({force: true});
        cy.get('.sub-menu')
            .contains('REST API')
            .click({force: true})
            .url()
            .should('include', '/webapi');
        cy.get('.sub-menu')
            .contains('Documentation')
            .then(function (item) {
                var href = item.prop('href');

                expect(href, 'http://graphdb.ontotext.com/documentation/enterprise/');
            });
        cy.get('.sub-menu')
            .contains('Developer Hub')
            .then(function (item) {
                var href = item.prop('href');

                expect(href, 'http://graphdb.ontotext.com/free/devhub/');
            });
        cy.get('.sub-menu')
            .contains('Support')
            .then(function (item) {
                var href = item.prop('href');
                expect(href, 'http://graphdb.ontotext.com/');
            });
        cy.get('.sub-menu')
            .contains('System information')
            .click({force: true})
            .url()
            .should('include', '/sysinfo');
    });

});
