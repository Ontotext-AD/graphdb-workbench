import {QueryStubs} from "../../stubs/yasgui/query-stubs";
import {YasguiSteps} from "../../steps/yasgui/yasgui-steps";
import {LanguageSelectorSteps} from "../../steps/language-selector-steps";
import {YasqeSteps} from "../../steps/yasgui/yasqe-steps";
import {YasrSteps} from "../../steps/yasgui/yasr-steps";
import {SparqlEditorSteps} from "../../steps/sparql-editor-steps";

describe('Internationalization of ontotext-yasgui-web-component', () => {

    beforeEach(() => {
        const repositoryId = 'sparql-editor-' + Date.now();
        cy.intercept('GET', '/rest/monitor/query/count', {body: 0});
        cy.createRepository({id: repositoryId});
        cy.presetRepository(repositoryId);
        QueryStubs.stubDefaultQueryResponse(repositoryId);
        SparqlEditorSteps.visitSparqlEditorPage();
    });

    it('Should translate labels when language is changed', () => {
        // When I load page I expect all labels to be translated on the default English language.
        YasguiSteps.getYasguiModeButton().contains('Editor and results');

        // When I execute a query I expect labels in table plugin to be translated on the default English language.
        YasqeSteps.executeQuery();

        // Then I expect label in table plugin to be translated on the default English language.
        YasrSteps.getResultFilter().invoke('attr', 'placeholder').should('contain', 'Filter query results');

        // When I change language to French.
        LanguageSelectorSteps.switchToFr();

        // Then I expect labels to be translated on French language.
        YasguiSteps.getYasguiModeButton().contains('Éditeur et résultats');

        // And I expect label in table plugin to be translated on French language.
        YasrSteps.getResultFilter().invoke('attr', 'placeholder').should('contain', 'Filtrer les résultats des requêtes');
    });
});
