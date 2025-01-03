import HomeSteps from "../../steps/home-steps";
import {ResourceSteps} from "../../steps/resource/resource-steps";
import {QueryStubs} from "../../stubs/yasgui/query-stubs";
import {VisualGraphSteps} from "../../steps/visual-graph-steps";
import {SparqlEditorSteps} from "../../steps/sparql-editor-steps";
import {YasqeSteps} from "../../steps/yasgui/yasqe-steps";
import {YasrSteps} from "../../steps/yasgui/yasr-steps";
import {YasguiSteps} from "../../steps/yasgui/yasgui-steps";
import {JsonLdModalSteps} from "../../steps/json-ld-modal-steps";

const FILE_TO_IMPORT = 'resource-test-data.ttl';
const SUBJECT_RESOURCE = 'http:%2F%2Fexample.com%2Fontology%23CustomerLoyalty';
const SUBJECT_RESOURCE_SHORT_URI = 'http://example.com/ontology#CustomerLoyalty';
const PREDICATE_SOURCE = 'http:%2F%2Fwww.w3.org%2F2000%2F01%2Frdf-schema%23subClassOf';
const CONTEXT_EXPLICIT = 'http://www.ontotext.com/explicit';
const OBJECT_RESOURCE = 'http:%2F%2Fexample.com%2Fontology%23Metric';
const IMPLICIT_EXPLICIT_RESOURCE = 'http:%2F%2Fwww.w3.org%2F1999%2F02%2F22-rdf-syntax-ns%23type';
const TRIPLE_RESOURCE = '%3C%3C%3Chttp:%2F%2Fexample.com%2Fresource%2Fperson%2FW6J1827%3E%20%3Chttp:%2F%2Fexample.com%2Fontology%23hasAddress%3E%20%3Chttp:%2F%2Fexample.com%2Fresource%2Fperson%2FW6J1827%2Faddress%3E%3E%3E';

describe('Resource view', () => {
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

        cy.get('.ontotext-yasgui-loader').should('be.hidden');

        // When I click on "predicate" tab.
        ResourceSteps.selectPredicateRole();

        // Then I expect to see all triples including this with blank node.
        YasrSteps.getResults().should('have.length', 6);

        // When I turn off showing of blank nodes.
        ResourceSteps.clickOnShowBlankNodesButton();

        // Then I expect to see all triples including this with blank node.
        YasrSteps.getResults().should('have.length', 5);
    });

    /**
     * TODO: Fix me. Broken due to migration (problem with '/graphs-visualizations' view)
     */
    it.skip('should navigate to visual graph view', () => {
        // When I am on resource view and page loaded a resource.
        ResourceSteps.visit(`uri=${SUBJECT_RESOURCE}&role=subject`);

        // When I click on "Visual graph" button.
        ResourceSteps.clickOnVisualGraphButton();

        // Then I expect to be redirected to explore graph view.
        VisualGraphSteps.verifyUrl();
    });

    it('should displays results depends on explicit/implicit dropdown', () => {
        // When I am on resource view and page loaded a resource that has triplets in explicit and implicit context,
        ResourceSteps.visit(`uri=${IMPLICIT_EXPLICIT_RESOURCE}&role=all`);

        // Then I expect to see all triples of explicit context, because default value of the dropdown is "Explicit only".
        YasrSteps.getResults().should('have.length', 24);
        YasrSteps.getResultLink(0, 4).should('contain', CONTEXT_EXPLICIT);

        // When I chose to display implicit only.
        ResourceSteps.selectImplicitOnlyInference();

        // Then I expect triples of implicit context to be displayed only.
        YasrSteps.getResults().should('have.length', 67);

        // When I chose to display both context.
        ResourceSteps.selectExplicitAndImplicitInference();

        // Then  I expect the triples of both context to be displayed.
        YasrSteps.getResults().should('have.length', 91);

        // When I chose to display explicit context only.
        ResourceSteps.selectExplicitOnlyInference();

        // Then I expect triples of explicit context to be displayed only.
        YasrSteps.getResults().should('have.length', 24);
    });

    context('Same as', () => {

        it('should display sameAs button when is enabled by user settings', () => {
            // When I am on resource view and page loaded a resource that has triplets in explicit and implicit context,
            ResourceSteps.visit(`uri=${IMPLICIT_EXPLICIT_RESOURCE}&role=all`);

            // Then I expect same as button to not be displayed.
            ResourceSteps.getSameAsButton().should('not.exist');

            // When I select implicit context.
            ResourceSteps.selectImplicitOnlyInference();

            // Then I expect same as button to be displayed.
            ResourceSteps.getSameAsButton().should('exist');

            // When I select both contexts.
            ResourceSteps.selectExplicitAndImplicitInference();

            // Then I expect same as button to be displayed.
            ResourceSteps.getSameAsButton().should('exist');

            // When I select explicit context.
            ResourceSteps.selectExplicitOnlyInference();

            // Then I expect same as button to be displayed.
            ResourceSteps.getSameAsButton().should('not.exist');
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
            YasrSteps.getResults().should('have.length', 1);
            YasrSteps.getResultLink(0, 1).should('contain', SUBJECT_RESOURCE_SHORT_URI);
            YasrSteps.getResultLink(0, 2).should('contain', 'rdfs:subClassOf');
            YasrSteps.getResultLink(0, 3).should('contain', 'http://example.com/ontology#Metric');
            YasrSteps.getResultLink(0, 4).should('contain', CONTEXT_EXPLICIT);

            // When I click on "predicate" tab.
            ResourceSteps.selectPredicateRole();

            // Then I expect to not see any triplets because the resource is not used as predicate.
            YasrSteps.getNoDataElement().should('be.visible');

            // When I click on "object" tab.
            ResourceSteps.selectObjectRole();
            // Then I expect to see all triples where the resource is object.
            YasrSteps.getResults().should('have.length', 1);
            YasrSteps.getResultLink(0, 1).should('contain', 'http://example.com/resource/person/W6J1827/customerLoyalty');
            YasrSteps.getResultLink(0, 2).should('contain', 'rdf:type');
            YasrSteps.getResultLink(0, 3).should('contain', SUBJECT_RESOURCE_SHORT_URI);
            YasrSteps.getResultLink(0, 4).should('contain', CONTEXT_EXPLICIT);

            // When I click on "context" tab.
            ResourceSteps.selectContextRole();

            // Then I expect to see empty results because this resource has not triples as context.
            YasrSteps.getNoDataElement().should('exist');

            // When I click on "all" tab.
            ResourceSteps.selectAllRole();

            // Then I expect to see all triples of subject without mater of its role.
            YasrSteps.getResults().should('have.length', 2);

            YasrSteps.getResultLink(0, 1).should('contain', SUBJECT_RESOURCE_SHORT_URI);
            YasrSteps.getResultLink(0, 2).should('contain', 'rdfs:subClassOf');
            YasrSteps.getResultLink(0, 3).should('contain', 'http://example.com/ontology#Metric');
            YasrSteps.getResultLink(0, 4).should('contain', CONTEXT_EXPLICIT);

            YasrSteps.getResultLink(1, 1).should('contain', 'http://example.com/resource/person/W6J1827/customerLoyalty');
            YasrSteps.getResultLink(1, 2).should('contain', 'rdf:type');
            YasrSteps.getResultLink(1, 3).should('contain', SUBJECT_RESOURCE_SHORT_URI);
            YasrSteps.getResultLink(1, 4).should('contain', CONTEXT_EXPLICIT);
        });

        it('should list the triples of a resource used as predicate', () => {
            // When I load resource that is predicate.
            ResourceSteps.visit(`uri=${PREDICATE_SOURCE}&role=subject`);

            // Then I expect to see empty results because this resource has not triples as subject.
            YasrSteps.getNoDataElement().should('be.visible');

            // When I click on "predicate" tab.
            ResourceSteps.selectPredicateRole();

            // Then I expect to see all triples where resource is predicate .
            YasrSteps.getResults().should('have.length', 6);

            // When I click on "object" tab.
            ResourceSteps.selectObjectRole();

            // Then I expect to empty result because the resource has not triples as object.
            YasrSteps.getNoDataElement().should('be.visible');

            // When I click on "context" tab.
            ResourceSteps.selectContextRole();

            // Then I expect to empty result because the resource has not triples as context.
            YasrSteps.getNoDataElement().should('be.visible');

            // When I click on "all" tab.
            ResourceSteps.selectAllRole();

            // Then I expect to see all triples of subject without mater of its role.
            YasrSteps.getResults().should('have.length', 6);
        });

        it('should list the triples of a resource used as object', () => {
            // When I load resource that is used as object.
            ResourceSteps.visit(`uri=${OBJECT_RESOURCE}&role=subject`);

            // Then I expect to see empty results because this resource has not triples as subject.
            YasrSteps.getNoDataElement().should('be.visible');

            // When I click on "predicate" tab.
            ResourceSteps.selectPredicateRole();

            // Then I expect to see empty results because this resource has not triples as predicate.
            YasrSteps.getNoDataElement().should('be.visible');

            // When I click on "object" tab.
            ResourceSteps.selectObjectRole();

            // Then I expect to see all triples of resource without mater of its role.
            YasrSteps.getResults().should('have.length', 6);

            // When I click on "context" tab.
            ResourceSteps.selectContextRole();

            // Then I expect to empty result because the resource has not triples as context.
            YasrSteps.getNoDataElement().should('exist');

            // When I click on "all" tab.
            ResourceSteps.selectAllRole();

            // Then I expect to see all triples of resource without mater of its role.
            YasrSteps.getResults().should('have.length', 6);
        });

        it('should list the triples of a resource used as context', () => {
            // When I load resource that is used as context.
            ResourceSteps.visit(`uri=${CONTEXT_EXPLICIT}&role=subject`);


            // Then I expect to see empty results because this resource has not triples as subject.
            YasrSteps.getNoDataElement().should('be.visible');

            // When I click on "predicate" tab.
            ResourceSteps.selectPredicateRole();

            // Then I expect to see empty results because this resource has not triples as predicate.
            YasrSteps.getNoDataElement().should('be.visible');

            // When I click on "object" tab.
            ResourceSteps.selectObjectRole();

            // Then I expect to empty result because the resource has not triples as object.
            YasrSteps.getNoDataElement().should('be.visible');

            // When I click on "context" tab.
            ResourceSteps.selectContextRole();

            // Then I expect to see all triples of resource without mater of its role,
            YasrSteps.getResults().should('have.length', 86);
            // and inference dropdown should be disabled.
            ResourceSteps.getInferenceSelectElement().should('be.disabled');

            // When I click on "all" tab.
            ResourceSteps.selectAllRole();

            // Then I expect to see all triples of resource without mater of its role.
            YasrSteps.getResults().should('have.length', 86);
        });
    });

    /**
     * TODO: Fix me. Broken due to migration (problem with yasgui in resource view)
     */
    context.skip('Triple resource', () => {

        it('should show triple resource', {
            retries: {
                runMode: 1,
                openMode: 0
            }
        }, () => {
            // When I visit resource view with triple resource.
            ResourceSteps.visit(`triple=${TRIPLE_RESOURCE}&role=subject`);

            // Then I expect resource link to exist.
            ResourceSteps.getTripleResourceLink().should('contain.text', '<<<W6J1827> <hasAddress> <address>>>');

            // When I click on the link.
            ResourceSteps.clickOnTripleResourceLink();

            // Then I expect to see sparql query view,
            SparqlEditorSteps.verifyUrl();
            YasguiSteps.getTabs().should('have.length', 2);
            // and a describe query to be present
            YasqeSteps.getActiveTabQuery().should('contain', 'describe <<<http://example.com/resource/person/W6J1827> <http://example.com/ontology#hasAddress> <http://example.com/resource/person/W6J1827/address>>>');

            // When I visit resource view with triple resource.
            ResourceSteps.visit(`triple=${TRIPLE_RESOURCE}&role=subject`);

            // Then I expect target link to exist.
            ResourceSteps.getTargetLink().should('contain.text', '<<<http://example.com/resource/person/W6J1827> <http://example.com/ontology#hasAddress> <http://example.com/resource/person/W6J1827/address>>>');

            // When I click on the link.
            ResourceSteps.clickOnTripleResourceLink();

            // Then I expect to see sparql query view,
            SparqlEditorSteps.verifyUrl();
            YasguiSteps.getTabs().should('have.length', 2);
            // and a describe query to be present
            YasqeSteps.getActiveTabQuery().should('contain', 'describe <<<http://example.com/resource/person/W6J1827> <http://example.com/ontology#hasAddress> <http://example.com/resource/person/W6J1827/address>>>');
            YasguiSteps.getCurrentTab().should('contain', 'Unnamed 1');
        });
    });

    context('Download as', () => {
        it('should download as JSON-LD and then restore defaults', () => {
            // Given I am in the Resource view
            ResourceSteps.visit(`uri=${SUBJECT_RESOURCE}&role=subject`);
            ResourceSteps.verifyActiveRoleTab('subject');

            // When I download as JSON-LD
            ResourceSteps.clickDownloadAsOption(1);

            // Then I should see a dialog appear
            JsonLdModalSteps.getJSONLDModal().should('be.visible');

            // And I type some example data into the form
            JsonLdModalSteps.selectJSONLDMode(0);
            JsonLdModalSteps.typeJSONLDFrame('https://w3c.github.io/json-ld-api/tests/compact/0007-context.jsonld');

            // And export a file
            JsonLdModalSteps.clickExportJSONLD();

            // Then the dialog should disappear
            JsonLdModalSteps.getJSONLDModal().should('not.exist');

            // And the file should have downloaded
            JsonLdModalSteps.verifyFileExists('statements.jsonld');

            // When I select the same download as option again and the dialog appears with the prior data
            ResourceSteps.clickDownloadAsOption(1);
            JsonLdModalSteps.getJSONLDModal().should('be.visible');
            JsonLdModalSteps.getSelectedJSONLDModeField().should('have.value', 'http://www.w3.org/ns/json-ld#framed');
            JsonLdModalSteps.getJSONLDFrame().should('have.value', 'https://w3c.github.io/json-ld-api/tests/compact/0007-context.jsonld');

            // Then clicking the 'Restore defaults' button should reset the data in the form
            JsonLdModalSteps.clickRestoreDefaultsJSONLD();
            JsonLdModalSteps.getSelectedJSONLDModeField().should('have.value', 'http://www.w3.org/ns/json-ld#expanded');
        });
    });
});
