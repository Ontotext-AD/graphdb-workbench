import HomeSteps from "../../steps/home-steps";
import {ResourceSteps, TRIPLE_TERM_ROLE_LABEL} from "../../steps/resource/resource-steps";
import {QueryStubs} from "../../stubs/yasgui/query-stubs";
import {VisualGraphSteps} from "../../steps/visual-graph-steps";
import {SparqlEditorSteps} from "../../steps/sparql-editor-steps";
import {YasqeSteps} from "../../steps/yasgui/yasqe-steps";
import {YasrSteps} from "../../steps/yasgui/yasr-steps";
import {YasguiSteps} from "../../steps/yasgui/yasgui-steps";
import {JsonLdModalSteps} from "../../steps/json-ld-modal-steps";
import {GraphConfigStubs} from '../../stubs/graph-config-stubs.js';
import {VisualGraphSplitButtonSteps} from '../../steps/visual-graph-split-button-steps.js';

const FILE_TO_IMPORT = 'resource-test-data.ttl';
const SUBJECT_RESOURCE_ENCODED = 'http:%2F%2Fexample.com%2Fontology%23CustomerLoyalty';
const SUBJECT_RESOURCE = 'http://example.com/ontology#CustomerLoyalty';
const PREDICATE_SOURCE = 'http:%2F%2Fwww.w3.org%2F2000%2F01%2Frdf-schema%23subClassOf';
const CONTEXT_EXPLICIT = 'http://www.ontotext.com/explicit';
const OBJECT_RESOURCE = 'http:%2F%2Fexample.com%2Fontology%23Metric';
const IMPLICIT_EXPLICIT_RESOURCE = 'http:%2F%2Fwww.w3.org%2F1999%2F02%2F22-rdf-syntax-ns%23type';
// A triple term in the SPARQL 1.2 syntax. The resource view expects it wrapped in <<( )>>.
const TRIPLE_RESOURCE_DECODED = '<<(<http://example.com/resource/person/W6J1827> <http://example.com/ontology#hasAddress> <http://example.com/resource/person/W6J1827/address>)>>';
const TRIPLE_RESOURCE = encodeURIComponent(TRIPLE_RESOURCE_DECODED);
const TRIPLE_RESOURCE_LOCAL_NAMES = '<<(<W6J1827> <hasAddress> <address>)>>';
// A triple term whose object is a literal. It is deliberately not part of the test data, because it is
// used only to verify that shortening the IRIs of a triple term leaves its literals untouched.
const LITERAL_TRIPLE_RESOURCE_DECODED = '<<(<http://example.com/resource/person/W6J1827> <http://example.com/ontology#firstName> "Burgunda")>>';
const LITERAL_TRIPLE_RESOURCE = encodeURIComponent(LITERAL_TRIPLE_RESOURCE_DECODED);
const LITERAL_TRIPLE_RESOURCE_LOCAL_NAMES = '<<(<W6J1827> <firstName> "Burgunda")>>';
// The number of statements the resource view lists for the triple term - the four statements which
// annotate it in the test data plus the "rdf:reifies" statement which binds its reifier to it.
const TRIPLE_RESOURCE_STATEMENTS_COUNT = 5;
// The query which the resource view builds for a triple term - it looks up all statements having the triple term as an object.
const TRIPLE_TERM_LOOKUP_QUERY = `SELECT ?s ?p ?tt
WHERE {
    VALUES ?tt {
        ${TRIPLE_RESOURCE_DECODED}
    }
    ?s ?p ?tt .
}`;
// The link which both the header and the target link of a triple term point to.
const TRIPLE_TERM_LOOKUP_HREF = `sparql?query=${encodeURIComponent(TRIPLE_TERM_LOOKUP_QUERY)}`;
// The statement counts of the test data. The data annotates eleven triples with the RDF 1.2 reification
// syntax (<<s p o>>), and GraphDB expands each of them to a reifier plus an "rdf:reifies" statement
// pointing at the triple term. Those eleven extra statements are the reason why these counts are higher
// than the ones expected before the SPARQL 1.2 support was added.
const EXPLICIT_TYPE_STATEMENTS_COUNT = 24;
const IMPLICIT_TYPE_STATEMENTS_COUNT = 68;
const ALL_TYPE_STATEMENTS_COUNT = EXPLICIT_TYPE_STATEMENTS_COUNT + IMPLICIT_TYPE_STATEMENTS_COUNT;
const EXPLICIT_GRAPH_STATEMENTS_COUNT = 97;

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
        ResourceSteps.getPlainResourceRoles().forEach((role) => {
            ResourceSteps.visit(`uri=${SUBJECT_RESOURCE_ENCODED}&role=${role}`);
            ResourceSteps.verifyActiveRoleTab(role);
        });
    });

    it('should open subject tab if role parameter is miss', () => {
        ResourceSteps.visit(`uri=${SUBJECT_RESOURCE_ENCODED}&role=subject`);
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

    it('should open graphs-visualizations view when click on main button', () => {
        // When I am on resource view and page loaded a resource.
        ResourceSteps.visit(`uri=${SUBJECT_RESOURCE_ENCODED}&role=subject`);

        // When I click on "Visual graph" button.
        VisualGraphSplitButtonSteps.clickOnVisualizeMainButton();

        // Then I expect to be redirected to explore graph view.
        VisualGraphSteps.verifyUrl();
    });

    it('should open graphs-visualizations view when select a graph configuration', () => {
        // When I am on resource view and page loaded a resource.
        ResourceSteps.visit(`uri=${SUBJECT_RESOURCE_ENCODED}&role=subject`);
        GraphConfigStubs.stubGetGraphConfigs();

        // WHEN: I open the dropdown.
        VisualGraphSplitButtonSteps.toggleGraphConfigDropdown();
        // THEN: I expect to see all graph configurations.
        VisualGraphSplitButtonSteps.getGraphConfigs().should('have.length', 3);

        // WHEN: I select a graph configuration
        VisualGraphSplitButtonSteps.selectGraphConfig();
        // THEN: I expect to be navigated to graphs-visualizations view.
        cy.url().should('include', 'graphs-visualizations');
        cy.getQueryParam('uri').should('include', SUBJECT_RESOURCE);
        cy.getQueryParam('config').should('eq', 'de99fd5de7f94ef98f1875dff55fc1c9');
    });

    it('should displays results depends on explicit/implicit dropdown', () => {
        // When I am on resource view and page loaded a resource that has triplets in explicit and implicit context,
        ResourceSteps.visit(`uri=${IMPLICIT_EXPLICIT_RESOURCE}&role=all`);

        // Then I expect to see all triples of explicit context, because default value of the dropdown is "Explicit only".
        YasrSteps.getResults().should('have.length', EXPLICIT_TYPE_STATEMENTS_COUNT);
        YasrSteps.getResultLink(0, 4).should('contain', CONTEXT_EXPLICIT);

        // When I chose to display implicit only.
        ResourceSteps.selectImplicitOnlyInference();

        // Then I expect triples of implicit context to be displayed only.
        YasrSteps.getResults().should('have.length', IMPLICIT_TYPE_STATEMENTS_COUNT);

        // When I chose to display both context.
        ResourceSteps.selectExplicitAndImplicitInference();

        // Then  I expect the triples of both context to be displayed.
        YasrSteps.getResults().should('have.length', ALL_TYPE_STATEMENTS_COUNT);

        // When I chose to display explicit context only.
        ResourceSteps.selectExplicitOnlyInference();

        // Then I expect triples of explicit context to be displayed only.
        YasrSteps.getResults().should('have.length', EXPLICIT_TYPE_STATEMENTS_COUNT);
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
            ResourceSteps.visit(`uri=${SUBJECT_RESOURCE_ENCODED}&role=subject`);

            // Then I expect to see only one result because the resource has only one triplet as subject.
            YasrSteps.getResults().should('have.length', 1);
            YasrSteps.getResultLink(0, 1).should('contain', SUBJECT_RESOURCE);
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
            YasrSteps.getResultLink(0, 3).should('contain', SUBJECT_RESOURCE);
            YasrSteps.getResultLink(0, 4).should('contain', CONTEXT_EXPLICIT);

            // When I click on "context" tab.
            ResourceSteps.selectContextRole();

            // Then I expect to see empty results because this resource has not triples as context.
            YasrSteps.getNoDataElement().should('exist');

            // When I click on "all" tab.
            ResourceSteps.selectAllRole();

            // Then I expect to see all triples of subject without mater of its role.
            YasrSteps.getResults().should('have.length', 2);

            YasrSteps.getResultLink(0, 1).should('contain', SUBJECT_RESOURCE);
            YasrSteps.getResultLink(0, 2).should('contain', 'rdfs:subClassOf');
            YasrSteps.getResultLink(0, 3).should('contain', 'http://example.com/ontology#Metric');
            YasrSteps.getResultLink(0, 4).should('contain', CONTEXT_EXPLICIT);

            YasrSteps.getResultLink(1, 1).should('contain', 'http://example.com/resource/person/W6J1827/customerLoyalty');
            YasrSteps.getResultLink(1, 2).should('contain', 'rdf:type');
            YasrSteps.getResultLink(1, 3).should('contain', SUBJECT_RESOURCE);
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
            YasrSteps.getResults().should('have.length', EXPLICIT_GRAPH_STATEMENTS_COUNT);
            // and inference dropdown should be disabled.
            ResourceSteps.getInferenceSelectElement().should('be.disabled');

            // When I click on "all" tab.
            ResourceSteps.selectAllRole();

            // Then I expect to see all triples of resource without mater of its role.
            YasrSteps.getResults().should('have.length', EXPLICIT_GRAPH_STATEMENTS_COUNT);
        });

        it('should keep all role tabs enabled when the resource is not a triple term', () => {
            // When I load a resource which is not a triple term.
            ResourceSteps.visit(`uri=${SUBJECT_RESOURCE_ENCODED}&role=subject`);

            // Then I expect all role tabs to be enabled,
            ResourceSteps.getPlainResourceRoles().forEach((role) => ResourceSteps.verifyRoleTabEnabled(role));

            // and the triple term links to not be rendered,
            ResourceSteps.getTripleResourceLink().should('not.exist');
            ResourceSteps.getTargetLink().should('not.exist');

            // but the source link of a plain resource to be rendered instead.
            ResourceSteps.getSourceLink().should('exist');
        });

        it('should not offer the "triple term" role tab when the resource is not a triple term', () => {
            // When I load a resource which is not a triple term.
            ResourceSteps.visit(`uri=${SUBJECT_RESOURCE_ENCODED}&role=subject`);

            // Then I expect the "triple term" tab to not be rendered at all, because that role
            // applies to triple terms only,
            ResourceSteps.verifyRoleTabMissing(TRIPLE_TERM_ROLE_LABEL);
            // and only the roles of a plain resource to be offered.
            ResourceSteps.getRoleTabs().should('have.length', ResourceSteps.getPlainResourceRoles().length);
        });

        it('should fall back to the subject role when the url asks for the "triple term" role of a plain resource', () => {
            // When I load a resource which is not a triple term with the triple term role.
            ResourceSteps.visit(`uri=${SUBJECT_RESOURCE_ENCODED}&role=triple-term`);

            // Then I expect the role to fall back to the default one,
            ResourceSteps.verifyActiveRoleTab('subject');
            // and the role url parameter to be corrected as well.
            cy.getQueryParam('role').should('eq', 'subject');

            // And I expect the triples of the resource as subject to be listed.
            YasrSteps.getResults().should('have.length', 1);
            YasrSteps.getResultLink(0, 1).should('contain', SUBJECT_RESOURCE);
        });
    });

    context('Triple resource', () => {
        it('should show triple resource shortened in the header and in full as a target', () => {
            // When I visit resource view with triple resource.
            ResourceSteps.visit(`triple=${TRIPLE_RESOURCE}&role=subject`);

            // Then I expect the header link to show the triple term with shortened IRIs,
            ResourceSteps.verifyTrimmedText(ResourceSteps.getTripleResourceLink(), TRIPLE_RESOURCE_LOCAL_NAMES);
            // and the full triple term to be shown as a tooltip.
            ResourceSteps.getTripleResourceLink().should('have.attr', 'gdb-tooltip', TRIPLE_RESOURCE_DECODED);

            // And I expect the target link to show the triple term with its full IRIs.
            ResourceSteps.verifyTrimmedText(ResourceSteps.getTargetLink(), TRIPLE_RESOURCE_DECODED);

            // And I expect the source link of a plain resource to not be rendered.
            ResourceSteps.getSourceLink().should('not.exist');

            // And I expect to see data table with the statements annotating the triple term.
            ResourceSteps.getDataTable().should('exist').and('be.visible');
            YasrSteps.getResults().should('have.length', TRIPLE_RESOURCE_STATEMENTS_COUNT);
        });

        it('should shorten only the IRIs of a triple term and leave its literals unchanged', () => {
            // When I visit resource view with a triple term whose object is a literal.
            ResourceSteps.visit(`triple=${LITERAL_TRIPLE_RESOURCE}&role=subject`);

            // Then I expect the header link to show the IRIs shortened and the literal as it is,
            ResourceSteps.verifyTrimmedText(ResourceSteps.getTripleResourceLink(), LITERAL_TRIPLE_RESOURCE_LOCAL_NAMES);
            // and the target link to show the whole triple term as it is.
            ResourceSteps.verifyTrimmedText(ResourceSteps.getTargetLink(), LITERAL_TRIPLE_RESOURCE_DECODED);
        });

        it('should point both the header and the target link to the triple term lookup query', () => {
            // When I visit resource view with triple resource.
            ResourceSteps.visit(`triple=${TRIPLE_RESOURCE}&role=subject`);

            // Then I expect both links to point to the sparql editor with the triple term lookup query.
            ResourceSteps.getTripleResourceLink().should('have.attr', 'href', TRIPLE_TERM_LOOKUP_HREF);
            ResourceSteps.getTargetLink().should('have.attr', 'href', TRIPLE_TERM_LOOKUP_HREF);
        });

        it('should activate the "triple term" role tab and disable all other role tabs', () => {
            // When I visit resource view with triple resource.
            ResourceSteps.visit(`triple=${TRIPLE_RESOURCE}&role=subject`);

            // Then I expect the "triple term" tab to be the active one, regardless of the role url parameter,
            ResourceSteps.verifyActiveRoleTab(TRIPLE_TERM_ROLE_LABEL);
            // and the role url parameter to be corrected to the triple term role.
            cy.getQueryParam('role').should('eq', 'triple-term');

            // And I expect all other role tabs to be disabled.
            ResourceSteps.getRoleTabs().should('have.length', ResourceSteps.getAllRoles().length);
            ResourceSteps.getPlainResourceRoles().forEach((role) => ResourceSteps.verifyRoleTabDisabled(role));

            // When I click on a disabled role tab.
            ResourceSteps.selectSubjectRole();

            // Then I expect the role to remain unchanged.
            ResourceSteps.verifyActiveRoleTab(TRIPLE_TERM_ROLE_LABEL);
            cy.getQueryParam('role').should('eq', 'triple-term');
        });

        it('should activate the "triple term" role tab when the role url parameter is missing', () => {
            // When I visit resource view with a triple resource and without a role parameter.
            ResourceSteps.visit(`triple=${TRIPLE_RESOURCE}`);

            // Then I expect the "triple term" tab to be the active one,
            ResourceSteps.verifyActiveRoleTab(TRIPLE_TERM_ROLE_LABEL);
            // and the role url parameter to be set to the triple term role.
            cy.getQueryParam('role').should('eq', 'triple-term');
        });

        // The header link and the target link render the same triple term, so both of them have to lead
        // to the same lookup query in the sparql editor.
        [
            {label: 'header', click: () => ResourceSteps.clickOnTripleResourceLink()},
            {label: 'target', click: () => ResourceSteps.clickOnTargetLink()}
        ].forEach(({label, click}) => {
            it(`should open the sparql editor with a triple term lookup query when the ${label} link is clicked`, () => {
                // When I visit resource view with triple resource.
                ResourceSteps.visit(`triple=${TRIPLE_RESOURCE}&role=subject`);

                // When I click on the link.
                click();

                // Then I expect to see sparql query view,
                SparqlEditorSteps.verifyUrl();
                YasguiSteps.getTabs().should('have.length', 2);
                YasguiSteps.getCurrentTab().should('contain', 'Unnamed 1');
                // and the triple term lookup query to be present.
                YasqeSteps.getActiveTabQuery().should('eq', TRIPLE_TERM_LOOKUP_QUERY);
            });
        });
    });

    context('Download as', () => {
        it('should download as JSON-LD and then restore defaults', () => {
            // Given I am in the Resource view
            ResourceSteps.visit(`uri=${SUBJECT_RESOURCE_ENCODED}&role=subject`);
            cy.window().then((win) => {
                expect(win.jsonld).to.exist;
                cy.stub(win.jsonld, 'compact').resolves({
                    "@context": {
                        "dc11": "http://purl.org/dc/elements/1.1/",
                        "ex": "http://example.org/vocab#",
                        "ex:authored": {"@type": "@id"},
                        "ex:contains": {"@type": "@id"},
                        "foaf": "http://xmlns.com/foaf/0.1/"
                    }
                });
            });
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
