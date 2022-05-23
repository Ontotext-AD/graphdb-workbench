import SparqlSteps from '../../steps/sparql-steps';

describe('YASQE and YASR language change validation', () => {
    let repositoryId;

    beforeEach(() => {
        repositoryId = 'sparql-' + Date.now();
        SparqlSteps.createRepoAndVisit(repositoryId);
    });

    afterEach(() => {
        // Change the language back to English
        SparqlSteps.changeLanguage('Anglais');

        cy.deleteRepository(repositoryId);
    })

    context('Default language should be active and language change should affect labels', () => {
        it('should change labels in SPARQL view', () => {

            // Check some labels are in default language
            SparqlSteps.getSparqlQueryUpdateLabel().should('contain', 'SPARQL Query & Update');
            SparqlSteps.getDownloadBtn().should('contain', 'Download as');
            SparqlSteps.getEditorAndResultsBtn().should('contain', 'Editor and results');
            SparqlSteps.getResultsOnlyBtn().should('contain', 'Results only');

            SparqlSteps.changeLanguage('French');

            // The text in the labels should change
            SparqlSteps.getSparqlQueryUpdateLabel().should('contain', 'Requête et mise à jour SPARQL');
            SparqlSteps.getDownloadBtn().should('contain', 'Téléchargement');
            SparqlSteps.getEditorAndResultsBtn().should('contain', 'Éditeur et résultats');
            SparqlSteps.getResultsOnlyBtn().should('contain', 'Résultats seulement');
        });

        it('should change labels in SPARQL results view', function () {
            SparqlSteps.selectSavedQuery('Add statements');
            SparqlSteps.executeQuery();
            SparqlSteps.selectSavedQuery('SPARQL Select template');
            SparqlSteps.executeQuery();

            // Go to Results only view
            SparqlSteps.getResultsOnlyBtn().click();

            // Check some labels are in default language
            SparqlSteps.getTabWithTableText().should('contain', 'Table');
            SparqlSteps.getTabWithRawResponseText().should('contain', 'Raw Response');
            SparqlSteps.getTabWithPivotTableText().should('contain', 'Pivot Table');
            SparqlSteps.getTabWithGoogleChartText().should('contain', 'Google Chart');
            SparqlSteps.getResultsDescription().should('contain', 'Showing results from');

            SparqlSteps.changeLanguage('French');

            // The text in the labels should change
            SparqlSteps.getTabWithTableText().should('contain', 'Tableau');
            SparqlSteps.getTabWithRawResponseText().should('contain', 'Réponse brute');
            SparqlSteps.getTabWithPivotTableText().should('contain', 'Table de pivotement');
            SparqlSteps.getTabWithGoogleChartText().should('contain', 'Graphique Google');
            SparqlSteps.getResultsDescription().should('contain', 'Liste de résultats de');
        });
    });
})
