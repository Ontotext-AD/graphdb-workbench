import {SparqlEditorSteps} from "../../../steps/sparql-editor-steps";
import {YasguiSteps} from "../../../steps/yasgui/yasgui-steps";
import {YasqeSteps} from "../../../steps/yasgui/yasqe-steps";
import {YasrSteps} from "../../../steps/yasgui/yasr-steps";
import {ErrorPluginSteps} from "../../../steps/yasgui/plugin/error-plugin-steps";
import {ToasterSteps} from "../../../steps/toaster-steps";
import {QueryStubs} from "../../../stubs/yasgui/query-stubs";
import {RepositoriesStubs} from "../../../stubs/repositories/repositories-stubs";
import {AutocompleteStubs} from "../../../stubs/autocomplete/autocomplete-stubs";

// GraphDB marks every explain plan response with this comment. Yasgui recognizes it and renders the
// response with the explain plan plugin instead of the regular table one.
const EXPLAIN_PLAN_MARKER = '# NOTE: Optimization groups';
const EXPLAIN_PLAN_TITLE = 'Query explain plan';
// Comments which the LLM explain actions prepend to the query in order to narrow down what the LLM
// should explain.
const LLM_QUERY_ONLY_COMMENT = '# :gpt-query-only:';
const LLM_RESULT_ONLY_COMMENT = '# :gpt-result-only:';

const SELECT_QUERY = 'SELECT * WHERE { ?s ?p ?o } LIMIT 10';
const CONSTRUCT_QUERY = 'CONSTRUCT { ?s ?p ?o } WHERE { ?s ?p ?o } LIMIT 10';
const DESCRIBE_QUERY = 'DESCRIBE <http://example.com/resource>';
const UPDATE_QUERY = 'PREFIX : <http://bedrock/> INSERT DATA { :fred :hasSpouse :wilma. }';

describe('Explain query plan', () => {

    let repositoryId;

    beforeEach(() => {
        repositoryId = 'sparql-editor-explain-plan-' + Date.now();
        cy.createRepository({id: repositoryId});
        cy.presetRepository(repositoryId);
        QueryStubs.interceptQueries(repositoryId);

        SparqlEditorSteps.visitSparqlEditorPageAndWaitForEditor();
        YasguiSteps.getYasgui().should('be.visible');
        YasqeSteps.getRunSplitButton().should('have.class', 'hydrated');
        YasqeSteps.pasteQuery(SELECT_QUERY);
    });

    afterEach(() => {
        cy.deleteRepository(repositoryId);
    });

    it('Should render the query plan when explain query plan is executed', () => {
        // Given I have opened the sparql editor with a select query
        // When I execute the explain query plan action
        YasqeSteps.executeExplainQueryPlan();
        // Then I expect the query to be sent as an explain plan query
        verifyExplainRequest('explain');
        // And I expect the plan to be rendered instead of the regular results
        YasrSteps.getExplainPlanHeader().should('be.visible').and('contain', EXPLAIN_PLAN_TITLE);
        YasrSteps.getExplainPlan().should('be.visible').and('contain', EXPLAIN_PLAN_MARKER);
        // And I expect no error to be reported
        ErrorPluginSteps.getErrorPlugin().should('not.exist');
    });

    it('Should allow explain query plan for construct and describe queries', () => {
        // Given I have opened the sparql editor
        // When I execute the explain query plan action for a construct query
        YasqeSteps.pasteQuery(CONSTRUCT_QUERY);
        YasqeSteps.executeExplainQueryPlan();
        // Then I expect the query to be accepted and sent as an explain plan query.
        verifyExplainRequest('explain');
        ErrorPluginSteps.getErrorPlugin().should('not.exist');

        // When I execute the explain query plan action for a describe query
        YasqeSteps.pasteQuery(DESCRIBE_QUERY);
        YasqeSteps.executeExplainQueryPlan();
        // Then I expect the query to be accepted and sent as an explain plan query
        verifyExplainRequest('explain');
        ErrorPluginSteps.getErrorPlugin().should('not.exist');
    });

    it('Should reset the explain plan mode when the query is executed again', () => {
        // Given I have executed an explain query plan
        YasqeSteps.executeExplainQueryPlan();
        cy.wait('@explainQuery');
        YasrSteps.getExplainPlanPlugin().should('be.visible');

        // When I execute the query with the run button
        YasqeSteps.executeQuery();
        // Then I expect a regular query to be sent
        cy.wait('@plainQuery').then((interception) => {
            expect(interception.request.body).to.not.contain('explain=true');
        });
        // And I expect the results to be rendered with the regular plugin
        YasrSteps.getExplainPlanPlugin().should('not.exist');
        YasrSteps.getExtendedTablePlugin().should('be.visible');
    });

    it('Should not allow explain query plan for update queries', () => {
        // Given I have opened the sparql editor
        // When I execute the explain query plan action for an update query
        YasqeSteps.pasteQuery(UPDATE_QUERY);
        YasqeSteps.executeExplainQueryPlan();
        // Then I expect to be warned that explain works only with select, construct or describe
        ToasterSteps.getToasterMessage()
            .should('contain', 'Explain only works with SELECT, CONSTRUCT or DESCRIBE queries.');
        // And I expect no plan to be rendered
        YasrSteps.getExplainPlanPlugin().should('not.exist');
    });

    it('Should execute an explain request when LLM explain all is selected', () => {
        // Given I have opened the sparql editor with a select query
        // When I execute the LLM explain all action
        YasqeSteps.executeLlmExplainAll();
        // Then I expect a gpt explain request to be sent
        verifyExplainRequest('gpt');
        // And I expect the query to be sent without any of the LLM comments
        YasqeSteps.getQuery().should('not.contain', LLM_QUERY_ONLY_COMMENT);
        YasqeSteps.getQuery().should('not.contain', LLM_RESULT_ONLY_COMMENT);
    });

    it('Should execute an explain request when LLM explain query is selected', () => {
        // Given I have opened the sparql editor with a select query
        // When I execute the LLM explain query action
        YasqeSteps.executeLlmExplainQuery();
        // Then I expect a gpt explain request to be sent
        verifyExplainRequest('gpt');
        // And I expect the query to be marked, so that only the query gets explained
        YasqeSteps.getQuery().should('contain', LLM_QUERY_ONLY_COMMENT);
    });

    it('Should execute an explain request when LLM explain results is selected', () => {
        // Given I have opened the sparql editor with a select query
        // When I execute the LLM explain results action
        YasqeSteps.executeLlmExplainResults();
        // Then I expect a gpt explain request to be sent
        verifyExplainRequest('gpt');
        // And I expect the query to be marked, so that only the results get explained
        YasqeSteps.getQuery().should('contain', LLM_RESULT_ONLY_COMMENT);
    });
});

describe('Explain query plan for a virtual repository', () => {

    let repositoryId;

    beforeEach(() => {
        repositoryId = 'sparql-editor-explain-plan-' + Date.now();
        cy.presetRepository(repositoryId);
        RepositoriesStubs.stubOntopRepository(repositoryId);
        RepositoriesStubs.stubNameSpaces(repositoryId);
        AutocompleteStubs.stubAutocompleteEnabled(false);

        SparqlEditorSteps.visitSparqlEditorPageAndWaitForEditor();
        YasguiSteps.getYasgui().should('be.visible');
        YasqeSteps.getRunSplitButton().should('have.class', 'hydrated');
    });

    it('Should not allow explain query plan for virtual repositories', () => {
        // Given I have opened the editor configured for a virtual repository
        // When I execute the explain query plan action
        YasqeSteps.executeExplainQueryPlan();
        // Then I expect to be warned that explain is not supported
        ToasterSteps.getToasterMessage()
            .should('contain', 'Explain not supported for Virtual repositories.');
        // And I expect no plan to be rendered
        YasrSteps.getExplainPlanPlugin().should('not.exist');
    });
});

/**
 * Verifies that an explain request has been sent and has succeeded.
 * @param {string} explainType - 'explain' for the query plan, 'gpt' for the LLM explanations.
 */
const verifyExplainRequest = (explainType) => {
    cy.wait('@explainQuery').then((interception) => {
        expect(interception.request.body).to.contain('explain=true');
        expect(interception.request.body).to.contain(`explainType=${explainType}`);
        expect(interception.response.statusCode).to.equal(200);
    });
};
