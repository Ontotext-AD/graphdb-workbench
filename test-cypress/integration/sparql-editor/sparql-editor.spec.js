import {SparqlEditorSteps} from "../../steps/sparql-editor-steps";
import {YasguiSteps} from "../../steps/yasgui/yasgui-steps";
import {YasqeSteps} from "../../steps/yasgui/yasqe-steps";
import {YasrSteps} from "../../steps/yasgui/yasr-steps";
import {RepositorySelectorSteps} from "../../steps/repository-selector-steps";

describe('Sparql editor', () => {
    let repositoryId;
    let secondRepositoryId;

    beforeEach(() => {
        repositoryId = 'sparql-editor-' + Date.now();
        // QueryStubs.stubQueryCountResponse();
        cy.createRepository({id: repositoryId});
        cy.presetRepository(repositoryId);
    });

    afterEach(() => {
        cy.deleteRepository(repositoryId);
        cy.deleteRepository(secondRepositoryId);
    });

    it('Should load yasgui with default configuration', () => {
        // Given I have opened the workbench
        // When I visit the sparql editor page
        SparqlEditorSteps.visitSparqlEditorPage();
        // Then I should see the yasgui component
        YasguiSteps.getYasgui().should('be.visible');
        // When I execute the default query
        YasqeSteps.executeQuery();
        // Then I should see the results
        YasrSteps.getResults().should('be.visible').and('have.length.gt', 0);
    });

    it('Should reset yasgui state when repository is changed', () => {
        // create second repository
        secondRepositoryId = repositoryId + '-second';
        cy.createRepository({id: secondRepositoryId});
        // Given I have opened the sparql editor and executed a query
        SparqlEditorSteps.visitSparqlEditorPage();
        YasguiSteps.getYasgui().should('be.visible');
        YasqeSteps.executeQuery();
        YasrSteps.getResults().should('be.visible');
        // When I change the repository
        RepositorySelectorSteps.selectRepository(secondRepositoryId);
        // Then I expect yasgui to be visible
        YasguiSteps.getYasgui().should('be.visible');
        // And yasr results and plugins should not be visible
        YasrSteps.getYasrResultsContainer().should('be.empty');
        // And I should see a warning message that there are no results
        YasrSteps.getNoResultsMessage().should('be.visible');
        // And yasr tabs should not be visible
        YasrSteps.getResultHeader().should('not.be.visible');
    });

    it('Should paste and add prefixes', () => {
        // Given I have opened the workbench
        // When I visit the sparql editor page
        SparqlEditorSteps.visitSparqlEditorPage();
        YasqeSteps.clearEditor();
        const prefix = 'PREFIX afn: <http://jena.apache.org/ARQ/function#>\n';
        const query = 'select distinct ?x ?Person  where {\n' +
            '?x a afn:Person .\n' +
            '?x afn:preferredLabel ?Person .\n' +
            '?doc afn:containsMention / pub-old:hasInstance ?x .\n' +
            '}';
        // I paste a query into the editor
        cy.pasteIntoCodeMirror('.CodeMirror', query);
        // Then I expect the prefixes to be added automatically
        cy.get('.CodeMirror').then((codeMirrorElement) => {
            expect(codeMirrorElement[0].CodeMirror).to.exist;
            const codeMirror = codeMirrorElement[0].CodeMirror;
            // Wait, so that Yasqe can have time to replace the existing query with the new one
            cy.waitUntil(() => {
                return codeMirror.getValue() === prefix + query;
            }).then(() => {
                const value = codeMirror.getValue();
                expect(value).to.equal(prefix + query);
            });
        });
    });
});
