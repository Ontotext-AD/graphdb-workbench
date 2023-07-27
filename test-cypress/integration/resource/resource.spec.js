import HomeSteps from "../../steps/home-steps";
import {ResourceSteps} from "../../steps/resource/resource-steps";
import {GraphsVisualizationsSteps} from "../../steps/explore/graphs-visualizations-steps";
import {QueryStubs} from "../../stubs/yasgui/query-stubs";

const FILE_TO_IMPORT = 'resource-test-data.ttl';
const SUBJECT_RESOURCE = 'http:%2F%2Fexample.com%2F%2320';
const SUBJECT_RESOURCE_SHORT_URI = 'ex:20';
const PREDICATE_SOURCE = 'http:%2F%2Fwww.w3.org%2F2000%2F01%2Frdf-schema%23label';
const CONTEXT_EXPLICIT = 'http://www.ontotext.com/explicit';
const OBJECT_RESOURCE = 'http:%2F%2Fexample.com%2F%23City';
const IMPLICIT_EXPLICIT_RESOURCE = 'http:%2F%2Fwww.w3.org%2F1999%2F02%2F22-rdf-syntax-ns%23type';

describe('', () => {
    let repositoryId;
    beforeEach(() => {
        repositoryId = 'repository-' + Date.now();
        cy.createRepository({id: repositoryId});
        cy.presetRepository(repositoryId);
        cy.importServerFile(repositoryId, FILE_TO_IMPORT);
        HomeSteps.visitAndWaitLoader();
    });

    afterEach(() => {
        cy.deleteRepository(repositoryId);
    });

    it('should open resource view with active role tab depend on url role parameter', () => {
        ResourceSteps.getAllRoles().forEach((role) => {
            ResourceSteps.visit(`uri=${SUBJECT_RESOURCE}&role=${role}`);
            ResourceSteps.verifyActiveRoleTab(role);
        });
    });

    it('should open subject tab if role parameter is miss', () => {
        ResourceSteps.visit(`uri=${SUBJECT_RESOURCE}&role=subject`);
        ResourceSteps.verifyActiveRoleTab('subject');
    });

    it('should results contains/"not contains" depends on blank node flag', () => {
        // When I load a resource that takes part in a triple with a blank node.
        ResourceSteps.visit(`uri=${PREDICATE_SOURCE}&role=subject`);

        // When I click on "predicate" tab.
        ResourceSteps.selectPredicateRole();

        // Then I expect to see all triples including this with blank node.
        getAllResultRows().should('have.length', 546);

        // When I turn off showing of blank nodes.
        ResourceSteps.clickOnShowBlankNodesButton();

        // Then I expect to see all triples including this with blank node.
        getAllResultRows().should('have.length', 545);
    });

    it('should navigate to visual graph view', () => {
        // When I am on resource view and page loaded a resource.
        ResourceSteps.visit(`uri=${SUBJECT_RESOURCE}&role=subject`);

        // When I click on "Visual graph" button.
        ResourceSteps.clickOnVisualGraphButton();

        // Then I expect to be redirected to explore graph view.
        GraphsVisualizationsSteps.verifyUrl();
    });

    it('should displays results depends on explicit/implicit dropdown', () => {
        // When I am on resource view and page loaded a resource that has triplets in explicit and implicit context,
        ResourceSteps.visit(`uri=${IMPLICIT_EXPLICIT_RESOURCE}&role=all`);

        // Then I expect to see all triples of explicit context, because default value of the dropdown is "Explicit only".
        getAllResultRows().should('have.length', 574);
        getUriCellLink(0, 4).should('contain', CONTEXT_EXPLICIT);

        // When I chose to display implicit only.
        ResourceSteps.selectImplicitOnlyInference();

        // Then I expect triples of implicit context to be displayed only.
        getAllResultRows().should('have.length', 52);

        // When I chose to display both context.
        ResourceSteps.selectExplicitAndImplicitInference();

        // Then  I expect the triples of both context to be displayed.
        getAllResultRows().should('have.length', 626);

        // When I chose to display explicit context only.
        ResourceSteps.selectExplicitOnlyInference();

        // Then I expect triples of explicit context to be displayed only.
        getAllResultRows().should('have.length', 574);
    });

    context('Same as', () => {

        it('should display sameAs button when is enabled by user settings', () => {
            // When I am on resource view and page loaded a resource that has triplets in explicit and implicit context,
            ResourceSteps.visit(`uri=${IMPLICIT_EXPLICIT_RESOURCE}&role=all`);

            // Then I expect same as button to not be displayed.
            ResourceSteps.getSameAsButton().should('not.be.visible');

            // When I select implicit context.
            ResourceSteps.selectImplicitOnlyInference();

            // Then I expect same as button to be displayed.
            ResourceSteps.getSameAsButton().should('be.visible');

            // When I select both contexts.
            ResourceSteps.selectExplicitAndImplicitInference();

            // Then I expect same as button to be displayed.
            ResourceSteps.getSameAsButton().should('be.visible');

            // When I select explicit context.
            ResourceSteps.selectExplicitOnlyInference();

            // Then I expect same as button to be displayed.
            ResourceSteps.getSameAsButton().should('not.be.visible');
            }
        );

        it('should the "sameAs" button be enabled when "infer" and "sameAs" are set to true in the user settings', () => {
            // When I inference and same as are enabled.
            QueryStubs.stubInferAndSameAsDefaults(true, true);
            ResourceSteps.visit(`uri=${IMPLICIT_EXPLICIT_RESOURCE}&role=all`);
            ResourceSteps.selectImplicitOnlyInference();

            // Then I expect sameAs button is on.
            ResourceSteps.verifySameAsEnable();
        });

        it('should the "sameAs" button be disable when "infer" is set to true and "sameAs" is set to false in the user settings', () => {
            // When I inference and same as are enabled.
            QueryStubs.stubInferAndSameAsDefaults(true, false);
            ResourceSteps.visit(`uri=${IMPLICIT_EXPLICIT_RESOURCE}&role=all`);
            ResourceSteps.selectImplicitOnlyInference();

            // Then I expect sameAs is off.
            ResourceSteps.verifySameAsDisable();
        });

        it('should the "sameAs" button be disable when "infer" is set to false and "sameAs" is set to true in the user settings', () => {
            // When I inference and same as are enabled.
            QueryStubs.stubInferAndSameAsDefaults(false, true);
            ResourceSteps.visit(`uri=${IMPLICIT_EXPLICIT_RESOURCE}&role=all`);
            ResourceSteps.selectImplicitOnlyInference();

            // Then I expect sameAs is off.
            ResourceSteps.verifySameAsDisable();
        });

        it('should the "sameAs" button be disable when "infer" and "sameAs" are set to false in the user settings', () => {
            // When I inference and same as are enabled.
            QueryStubs.stubInferAndSameAsDefaults(false, false);
            ResourceSteps.visit(`uri=${IMPLICIT_EXPLICIT_RESOURCE}&role=all`);
            ResourceSteps.selectImplicitOnlyInference();

            // Then I expect sameAs is off.
            ResourceSteps.verifySameAsDisable();
        });
    });

    context('Role tabs', () => {
        it('should list the triples of a resource used as subject', () => {
            // When I am on resource view,
            // and page loaded a resource that is used as subject,
            ResourceSteps.visit(`uri=${SUBJECT_RESOURCE}&role=subject`);

            // Then I expect to see only one result because the resource has only one triplet as subject.
            getAllResultRows().should('have.length', 1);
            getUriCellLink(0, 1).should('contain', SUBJECT_RESOURCE_SHORT_URI);
            getUriCellLink(0, 2).should('contain', 'rdfs:label');
            getLiteralCell(0, 3).should('contain', '20');
            getUriCellLink(0, 4).should('contain', CONTEXT_EXPLICIT);

            // When I click on "predicate" tab.
            ResourceSteps.selectPredicateRole();

            // Then I expect to not see any triplets because the resource is not used as predicate.
            getNoDataElement().should('be.visible');

            // When I click on "object" tab.
            ResourceSteps.selectObjectRole();
            // Then I expect to see all triples where the resource is object.
            getAllResultRows().should('have.length', 2);
            getUriCellLink(0, 1).should('contain', 'ex:P39B197');
            getUriCellLink(0, 2).should('contain', 'ex:customerLoyalty');
            getUriCellLink(0, 3).should('contain', SUBJECT_RESOURCE_SHORT_URI);
            getUriCellLink(0, 4).should('contain', CONTEXT_EXPLICIT);

            getUriCellLink(1, 1).should('contain', 'ex:P4F3302');
            getUriCellLink(1, 2).should('contain', 'ex:customerLoyalty');
            getUriCellLink(1, 3).should('contain', SUBJECT_RESOURCE_SHORT_URI);
            getUriCellLink(1, 4).should('contain', CONTEXT_EXPLICIT);

            // When I click on "context" tab.
            ResourceSteps.selectContextRole();

            // Then I expect to see empty results because this resource has not triples as context.
            getAllResultRows().should('have.length', 0);

            // When I click on "all" tab.
            ResourceSteps.selectAlRole();

            // Then I expect to see all triples of subject without mater of its role.
            getAllResultRows().should('have.length', 3);

            getUriCellLink(0, 1).should('contain', SUBJECT_RESOURCE_SHORT_URI);
            getUriCellLink(0, 2).should('contain', 'rdfs:label');
            getLiteralCell(0, 3).should('contain', '20');
            getUriCellLink(0, 4).should('contain', CONTEXT_EXPLICIT);

            getUriCellLink(1, 1).should('contain', 'ex:P39B197');
            getUriCellLink(1, 2).should('contain', 'ex:customerLoyalty');
            getUriCellLink(1, 3).should('contain', SUBJECT_RESOURCE_SHORT_URI);
            getUriCellLink(1, 4).should('contain', CONTEXT_EXPLICIT);

            getUriCellLink(2, 1).should('contain', 'ex:P4F3302');
            getUriCellLink(2, 2).should('contain', 'ex:customerLoyalty');
            getUriCellLink(2, 3).should('contain', SUBJECT_RESOURCE_SHORT_URI);
            getUriCellLink(2, 4).should('contain', CONTEXT_EXPLICIT);
        });

        it('should list the triples of a resource used as predicate', () => {
            // When I load resource that is predicate.
            ResourceSteps.visit(`uri=${PREDICATE_SOURCE}&role=subject`);

            // Then I expect to see empty results because this resource has not triples as subject.
            getNoDataElement().should('be.visible');

            // When I click on "predicate" tab.
            ResourceSteps.selectPredicateRole();

            // Then I expect to see all triples where resource is predicate .
            getAllResultRows().should('have.length', 546);

            // When I click on "object" tab.
            ResourceSteps.selectObjectRole();

            // Then I expect to empty result because the resource has not triples as object.
            getNoDataElement().should('be.visible');

            // When I click on "context" tab.
            ResourceSteps.selectContextRole();

            // Then I expect to empty result because the resource has not triples as context.
            getNoDataElement().should('be.visible');

            // When I click on "all" tab.
            ResourceSteps.selectAlRole();

            // Then I expect to see all triples of subject without mater of its role.
            getAllResultRows().should('have.length', 546);
        });

        it('should list the triples of a resource used as object', () => {
            // When I load resource that is used as object.
            ResourceSteps.visit(`uri=${OBJECT_RESOURCE}&role=subject`);

            // Then I expect to see empty results because this resource has not triples as subject.
            getNoDataElement().should('be.visible');

            // When I click on "predicate" tab.
            ResourceSteps.selectPredicateRole();

            // Then I expect to see empty results because this resource has not triples as predicate.
            getNoDataElement().should('be.visible');

            // When I click on "object" tab.
            ResourceSteps.selectObjectRole();

            // Then I expect to see all triples of resource without mater of its role.
            getAllResultRows().should('have.length', 176);

            // When I click on "context" tab.
            ResourceSteps.selectContextRole();

            // Then I expect to empty result because the resource has not triples as context.
            getAllResultRows().should('have.length', 0);

            // When I click on "all" tab.
            ResourceSteps.selectAlRole();

            // Then I expect to see all triples of resource without mater of its role.
            getAllResultRows().should('have.length', 176);
        });

        it('should list the triples of a resource used as context', () => {
            // When I load resource that is used as context.
            ResourceSteps.visit(`uri=${CONTEXT_EXPLICIT}&role=subject`);

            // Then I expect to see empty results because this resource has not triples as subject.
            getNoDataElement().should('be.visible');

            // When I click on "predicate" tab.
            ResourceSteps.selectPredicateRole();

            // Then I expect to see empty results because this resource has not triples as predicate.
            getNoDataElement().should('be.visible');

            // When I click on "object" tab.
            ResourceSteps.selectObjectRole();

            // Then I expect to empty result because the resource has not triples as object.
            getNoDataElement().should('be.visible');

            // When I click on "context" tab.
            ResourceSteps.selectContextRole();

            // Then I expect to see all triples of resource without mater of its role.
            getAllResultRows().should('have.length', 1000);

            // When I click on "all" tab.
            ResourceSteps.selectAlRole();

            // Then I expect to see all triples of resource without mater of its role.
            getAllResultRows().should('have.length', 1000);
        });
    });

    function getAllResultRows() {
        // TODO change the follow selectors with YasrSteps functions
        return cy.get('.resultsTable tbody tr');
    }

    function getUriCellLink(row, column) {
        // TODO change the follow selectors with YasrSteps functions
        return getAllResultRows().eq(row).find('td').eq(column).find('a');
    }

    function getLiteralCell(row, column) {
        // TODO change the follow selectors with YasrSteps functions
        return cy.get('.resultsTable tbody tr').eq(row).find('td').eq(column).find('.nonUri');
    }

    function getNoDataElement() {
        // TODO change the follow selectors with YasrSteps functions
        return cy.get('.dataTables_empty');
    }
});
