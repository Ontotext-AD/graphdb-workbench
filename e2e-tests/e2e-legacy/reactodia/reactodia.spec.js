import {ReactodiaSteps} from '../../steps/reactodia-steps.js';
import {LanguageSelectorSteps} from '../../steps/language-selector-steps.js';
import {RepositorySelectorSteps} from '../../steps/repository-selector-steps.js';

const FILE_TO_IMPORT = 'resource-test-data.ttl';
const SEED_RESOURCE_ENCODED = 'http:%2F%2Fexample.com%2Fontology%23CustomerLoyalty';
const SEED_RESOURCE_LABEL = 'CustomerLoyalty';

const CONSTRUCT_QUERY = 'CONSTRUCT { <http://example.com/ontology#CustomerLoyalty> ?p ?o } WHERE { <http://example.com/ontology#CustomerLoyalty> ?p ?o }';
const CONSTRUCT_TARGET_LABEL = 'Metric';

describe('Reactodia graph explorer', () => {
    let repositoryId;

    beforeEach(() => {
        repositoryId = 'repository-' + Date.now();
        cy.createRepository({id: repositoryId});
        cy.presetRepository(repositoryId);
        cy.importServerFile(repositoryId, FILE_TO_IMPORT);
    });

    afterEach(() => {
        cy.deleteRepository(repositoryId);
    });

    it('should mount the reactodia workspace when a repository is active', () => {
        // Given I open the reactodia view without a start resource.
        ReactodiaSteps.visit();

        // Then I expect the reactodia workspace and its canvas to be rendered.
        ReactodiaSteps.getWorkspace().should('exist');
        ReactodiaSteps.getCanvas().should('exist');

        // And I expect the canvas to start empty because no start resource was provided.
        ReactodiaSteps.getElements().should('not.exist');
    });

    it('should place the start resource on the canvas as a seed', () => {
        // Given I open the reactodia view with a start resource.
        ReactodiaSteps.visit(SEED_RESOURCE_ENCODED);

        // Then I expect the start resource to be placed on the canvas as a seed element.
        ReactodiaSteps.getElements().should('have.length', 1);
        ReactodiaSteps.getElement(SEED_RESOURCE_LABEL).should('exist');
    });

    it('should seed the canvas with the graph computed from a CONSTRUCT query', () => {
        // Given I open the reactodia view with a CONSTRUCT query, as sent from the SPARQL editor.
        ReactodiaSteps.visitWithQuery(CONSTRUCT_QUERY);

        // Then I expect the computed graph to be seeded on the canvas: the subject and its related resource.
        ReactodiaSteps.getElements().should('have.length', 2);
        ReactodiaSteps.getElement(SEED_RESOURCE_LABEL).should('exist');
        ReactodiaSteps.getElement(CONSTRUCT_TARGET_LABEL).should('exist');
    });

    it('should keep the displayed resources when the language is switched', () => {
        // Given the reactodia view is opened with a start resource that gets seeded on the canvas.
        ReactodiaSteps.visit(SEED_RESOURCE_ENCODED);
        ReactodiaSteps.getElement(SEED_RESOURCE_LABEL).should('exist');
        ReactodiaSteps.getElements().should('have.length', 1);

        // When I switch the language.
        LanguageSelectorSteps.switchToFr();

        // Then I expect the same resources to remain visible because the layout is carried across the remount.
        ReactodiaSteps.getElements().should('have.length', 1);
        ReactodiaSteps.getElement(SEED_RESOURCE_LABEL).should('exist');
    });

    describe('Repository switch', () => {
        let secondRepositoryId;

        beforeEach(() => {
            secondRepositoryId = 'repository-second-' + Date.now();
            cy.createRepository({id: secondRepositoryId});
        });

        afterEach(() => {
            cy.deleteRepository(secondRepositoryId);
        });

        it('should clear the canvas when the repository is switched', () => {
            // Given the reactodia view is opened with a start resource that gets seeded on the canvas.
            ReactodiaSteps.visit(SEED_RESOURCE_ENCODED);
            ReactodiaSteps.getElements().should('have.length', 1);

            // When I switch to another repository.
            RepositorySelectorSteps.selectRepository(secondRepositoryId);

            // Then I expect the workspace to still be mounted, but the canvas to be cleared.
            ReactodiaSteps.getWorkspace().should('exist');
            ReactodiaSteps.getElements().should('not.exist');
        });
    });
});
