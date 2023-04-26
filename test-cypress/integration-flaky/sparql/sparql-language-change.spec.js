import SparqlSteps from '../../steps/sparql-steps';
import {LanguageSelectorSteps} from "../../steps/language-selector-steps";

describe('YASQE and YASR language change validation', () => {
    let repositoryId;

    beforeEach(() => {
        repositoryId = 'sparql-' + Date.now();
        SparqlSteps.createRepoAndVisit(repositoryId);
    });

    afterEach(() => {
        // Change the language back to English
        LanguageSelectorSteps.changeLanguage('en');

        cy.deleteRepository(repositoryId);
    });

    context('Default language should be active and language change should affect labels', () => {
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

            LanguageSelectorSteps.changeLanguage('fr');

            // The text in the labels should change
            SparqlSteps.getTabWithTableText().should('contain', 'Tableau');
            SparqlSteps.getTabWithRawResponseText().should('contain', 'Réponse brute');
            SparqlSteps.getTabWithPivotTableText().should('contain', 'Table de pivotement');
            SparqlSteps.getTabWithGoogleChartText().should('contain', 'Graphique Google');
            SparqlSteps.getResultsDescription().should('contain', 'Liste de résultats de');
        });
    });
})
