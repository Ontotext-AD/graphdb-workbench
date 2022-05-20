import SparqlSteps from '../../steps/sparql-steps';

describe('YASQE and YASR language change validation', () => {
    let repositoryId;

    beforeEach(() => {
        repositoryId = 'sparql-' + Date.now();
        SparqlSteps.createRepoAndVisit(repositoryId);
    });

    afterEach(() => {
        cy.deleteRepository(repositoryId);
        // Change the language back to English
        SparqlSteps.changeLanguage('Anglais');
    })

    context('Default language should be active and language change should affect labels', () => {
        it('should change labels in SPARQL view', () => {

            // Check some labels are in default language
            cy.contains('SPARQL Query & Update');
            cy.contains('Download as');
            cy.contains('Editor and results');
            cy.contains('Results only');

            SparqlSteps.changeLanguage('French');

            // The text in the labels should change
            cy.contains('Requête et mise à jour SPARQL');
            cy.contains('Téléchargement');
            cy.contains('Éditeur et résultats');
            cy.contains('Résultats seulement');
        });

        it('should change labels in SPARQL results view', function () {
            SparqlSteps.selectSavedQuery('Add statements');
            SparqlSteps.executeQuery();
            SparqlSteps.selectSavedQuery('SPARQL Select template');
            SparqlSteps.executeQuery();

            // Go to Results only view
            cy.contains('Results only').click();

            // Check some labels are in default language
            cy.contains('Table');
            cy.contains('Raw Response');
            cy.contains('Pivot Table');
            cy.contains('Google Chart');
            cy.get('input[placeholder=\"Filter query results\"]').should('be.visible');

            SparqlSteps.changeLanguage('French');

            // The text in the labels should change
            cy.contains('Tableau');
            cy.contains('Réponse brute');
            cy.contains('Table de pivotement');
            cy.contains('Graphique Google');
            cy.get('input[placeholder=\"Filtrer les résultats des requêtes\"]').should('be.visible');
        });
    });
})
