import {QueryStubs} from "../../stubs/yasgui/query-stubs";
import {PluginTabs, YasguiSteps} from "../../steps/yasgui/yasgui-steps";
import {LanguageSelectorSteps} from "../../steps/language-selector-steps";
import {YasqeSteps} from "../../steps/yasgui/yasqe-steps";
import {YasrSteps} from "../../steps/yasgui/yasr-steps";
import {SparqlEditorSteps} from "../../steps/sparql-editor-steps";
import {ImportUserDataSteps} from "../../steps/import/import-user-data-steps";

/**
 * TODO: Fix me. Broken due to migration (The language selector is changed)
 */
describe.skip('Internationalization of ontotext-yasgui-web-component', () => {
    let repositoryId;
    beforeEach(() => {
        repositoryId = 'sparql-editor-' + Date.now();
        QueryStubs.stubQueryCountResponse();
        cy.createRepository({id: repositoryId});
        cy.presetRepository(repositoryId);
        QueryStubs.stubDefaultQueryResponse(repositoryId);
        SparqlEditorSteps.visitSparqlEditorPage();
    });

    afterEach(() => {
        cy.deleteRepository(repositoryId);
    });

    it('Should translate labels when language is changed', () => {
        // When I load page I expect all labels to be translated to the default English language.
        YasguiSteps.getYasguiModeButton().contains('Editor and results');

        // When I execute a query I expect labels in table plugin to be translated to the default English language.
        YasqeSteps.executeQuery();

        // Then I expect label in table plugin to be translated to the default English language.
        YasrSteps.getResultFilter().invoke('attr', 'placeholder').should('contain', 'Filter query results');

        // When I change language to French
        LanguageSelectorSteps.switchToFr();

        // Then confirm the language change
        LanguageSelectorSteps.confirmLanguageChange();

        // Then I expect labels to be translated in French language
        PluginTabs.getGoogleChartsTab().should('contain.text', 'Graphique Google');
        YasguiSteps.getYasguiModeButton().contains('Éditeur et résultats');

        // And I expect label in table plugin to be translated in French language.
        YasrSteps.getResultFilter().invoke('attr', 'placeholder').should('contain', 'Filtrer les résultats des requêtes');
    });

    it('Should not translate when language change is cancelled', () => {
        // When I load page I expect all labels to be translated on the default English language
        YasguiSteps.getYasguiModeButton().contains('Editor and results');

        // When I execute a query I expect labels in table plugin to be translated in the default English language
        YasqeSteps.executeQuery();

        // Then I expect label in table plugin to be translated in the default English language
        YasrSteps.getResultFilter().invoke('attr', 'placeholder').should('contain', 'Filter query results');

        // When I change language to French
        LanguageSelectorSteps.switchToFr();

        // Then cancel the language change
        LanguageSelectorSteps.cancelLanguageChange();

        // Then I expect labels to be in English
        YasguiSteps.getYasguiModeButton().contains('Editor and results');

        // And I expect label in table plugin to remain in English
        YasrSteps.getResultFilter().invoke('attr', 'placeholder').should('contain', 'Filter query results');
    });

    it('Should translate labels when language is changed in another view', () => {
        // Given I open the Import page
        ImportUserDataSteps.visitImport('user', repositoryId);

        // When I change language to French
        LanguageSelectorSteps.switchToFr();

        // And return to the SPARQL view
        SparqlEditorSteps.visitSparqlEditorPage();

        // When I execute a query
        YasqeSteps.executeQuery();

        // Then I expect labels to be translated to French
        PluginTabs.getGoogleChartsTab().should('contain.text', 'Graphique Google');
        YasguiSteps.getYasguiModeButton().contains('Éditeur et résultats');

        // And I expect label in table plugin to be translated to French
        YasrSteps.getResultFilter().invoke('attr', 'placeholder').should('contain', 'Filtrer les résultats des requêtes');
    });
});
