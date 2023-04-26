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
        LanguageSelectorSteps.switchToEn();

        cy.deleteRepository(repositoryId);
    });

    context('Default language should be active and language change should affect labels', () => {
        it('should change labels in SPARQL view', () => {

            // Check some labels are in default language
            SparqlSteps.getSparqlQueryUpdateLabel().should('contain', 'SPARQL Query & Update');
            SparqlSteps.getDownloadBtn().should('contain', 'Download as');
            SparqlSteps.getEditorAndResultsBtn().should('contain', 'Editor and results');
            SparqlSteps.getResultsOnlyBtn().should('contain', 'Results only');

            LanguageSelectorSteps.switchToFr();

            // The text in the labels should change
            SparqlSteps.getSparqlQueryUpdateLabel().should('contain', 'Requête et mise à jour SPARQL');
            SparqlSteps.getDownloadBtn().should('contain', 'Téléchargement');
            SparqlSteps.getEditorAndResultsBtn().should('contain', 'Éditeur et résultats');
            SparqlSteps.getResultsOnlyBtn().should('contain', 'Résultats seulement');
        });

        it('should change "Download as" dropdown label. Test "GDB-8100" bug.', () => {

            // When I visit a page with YASQE and YASR in it,
            // and execute a query.
            SparqlSteps.executeQuery();

            // Then I expect 'Download as' to be translated to English.
            SparqlSteps.getDownloadBtn().should('contain', 'Download as');

            // When I change the language.
            LanguageSelectorSteps.changeLanguage('fr');

            // Then I expect 'Download as' to be translated to French.
            SparqlSteps.getDownloadBtn().should('contain', 'Téléchargement');

            // When I rerun the query.
            SparqlSteps.executeQuery();

            // Then I expect 'Download as' to be translated to French.
            SparqlSteps.getDownloadBtn().should('contain', 'Téléchargement');
        });
    });
});
