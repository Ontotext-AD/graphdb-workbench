import {SparqlEditorSteps} from "../../../steps/sparql-editor-steps";
import {YasqeSteps} from "../../../steps/yasgui/yasqe-steps";
import {RepositoriesStub} from "../../../stubs/repositories-stub";

/**
 * TODO: Fix me. Broken due to migration (Error: beforeEach)
 */
describe.skip('Expand results over owl:sameAs', () => {

    let repositoryId;

    beforeEach(() => {
        repositoryId = 'sparql-editor-' + Date.now();
        cy.setLocalStorage("ls.repository-id", repositoryId);
        RepositoriesStub.stubOntopRepository(repositoryId);
        RepositoriesStub.stubNameSpaces(repositoryId);
    });

    it('should not be able to toggle the sameAs button state if repository is virtual', () => {
        // When I open the editor configured for virtual repository.
        SparqlEditorSteps.visitSparqlEditorPage();

        // Then I expect sameAs button to be on.
        YasqeSteps.getExpandResultsOverSameAsButtonTooltip().should('have.attr', 'data-tooltip', 'Expand results over owl:sameAs: ON');
        YasqeSteps.getExpandResultsOverSameAsButton().should('have.class', 'icon-same-as-on');

        // When I click on inferred button
        YasqeSteps.getExpandResultsOverSameAsButton().click({force: true});

        // Then I expect sameAs button to not be toggled.
        YasqeSteps.getExpandResultsOverSameAsButtonTooltip().should('have.attr', 'data-tooltip', 'Expand results over owl:sameAs: ON');
        YasqeSteps.getExpandResultsOverSameAsButton().should('have.class', 'icon-same-as-on');
    });

    it('should not be able to toggle the inferred button state if repository is virtual', () => {
        // When I open the editor configured for virtual repository.
        SparqlEditorSteps.visitSparqlEditorPage();

        // Then I expect inferred button to be on.
        YasqeSteps.getActionButtonTooltip(3).should('have.attr', 'data-tooltip', 'Include inferred data in results: ON');
        YasqeSteps.getActionButton(3).should('have.class', 'icon-inferred-on');

        // When I click on inferred button
        YasqeSteps.getActionButton(3).click({force: true});

        // Then I expect inferred button to not be toggled.
        YasqeSteps.getActionButtonTooltip(3).should('have.attr', 'data-tooltip', 'Include inferred data in results: ON');
        YasqeSteps.getActionButton(3).should('have.class', 'icon-inferred-on');
    });
});
