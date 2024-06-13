import {SimilarityIndexCreateSteps} from "../../steps/explore/similarity-index-create-steps";
import {ErrorSteps} from "../../steps/error-steps";
import {YasqeSteps} from "../../steps/yasgui/yasqe-steps";

const FILE_TO_IMPORT = 'people.zip';
const INSERT_QUERY = 'PREFIX dc: <http://purl.org/dc/elements/1.1/>\n INSERT DATA\n{\nGRAPH <http://example> {\n<http://example/book1> dc:title "A new book" ;\ndc:creator "A.N.Other" .\n}\n}';
const INVALID_QUERY = 'SELECT ?documentID ?documentText { invalid query \n\t?documentID ?p ?documentText .\n\tfilter(isLiteral(?documentText))\n}';
const DEFAULT_SELECT_QUERY = 'SELECT ?documentID ?documentText {\n\t?documentID ?p ?documentText .\n\tfilter(isLiteral(?documentText))\n}';
const DEFAULT_SEARCH_QUERY = 'SELECT ?documentID ?score {\n    ?search a ?index ;\n        ?searchType ?query;\n        :searchParameters ?parameters;\n        ?resultType ?result .\n    ?result :value ?documentID ;\n            :score ?score.\n}';
const DEFAULT_ANALOGICAL_QUERY = 'SELECT?resultValue?score{?searcha?index;psi:givenSubject?givenSubject;psi:givenObject?givenObject;psi:searchSubject?searchSubject;:searchParameters?parameters;psi:resultObject?result.?result:value?resultValue;:score?score.}';
const DEFAULT_PREDICATION_SELECT_QUERY = 'SELECT ?subject ?predicate ?object\nWHERE {\n    ?subject ?predicate ?object .\n}';
const DEFAULT_PREDICATION_SEARCH_QUERY = 'SELECT ?entity ?score {\n ?search a ?index ;\n ?searchType ?query;\n psi:searchPredicate ?psiPredicate;\n :searchParameters ?parameters;\n ?resultType ?result .\n ?result :value ?entity ;\n :score ?score .\n}';

describe('Create similarity index', () => {
    let repositoryId;

    beforeEach(() => {
        repositoryId = 'similarity-index-create' + Date.now();
        cy.createRepository({id: repositoryId});
        cy.presetRepository(repositoryId);
        cy.importServerFile(repositoryId, FILE_TO_IMPORT);
        SimilarityIndexCreateSteps.visit();
    });

    afterEach(() => {
        cy.deleteRepository(repositoryId);
    });

    context('Validations for textual similarity index', () => {

        it('should not allow to create a similarity index without name', () => {
            // Given I am on "Create similarity index" page.
            // When I try to create a text index.
            SimilarityIndexCreateSteps.create();

            // Then I expect see error message describes me, that name is mandatory.
            ErrorSteps.verifyError('Index name cannot be empty');
        });

        it('should not allow to create a similarity index without select query', () => {
            // Given I am on "Create similarity index" page.
            // When I fill similarity index name,
            SimilarityIndexCreateSteps.typeSimilarityIndexName('indexName');
            // and try to create index without select query.
            YasqeSteps.clearEditor();
            SimilarityIndexCreateSteps.create();

            // Then I expect see error message describes me, that select query is mandatory.
            ErrorSteps.verifyError("The 'Data' query cannot be empty.");
        });

        it('should not allow to create a similarity index with select query', () => {
            // Given I am on "Create similarity index" page.
            // When I fill similarity index name,
            SimilarityIndexCreateSteps.typeSimilarityIndexName('indexName');
            // and try to create index with update select query.
            YasqeSteps.pasteQuery(INSERT_QUERY);

            SimilarityIndexCreateSteps.create();

            // Then I expect see error message describes me, that select query must be a SELECT.
            ErrorSteps.verifyError("The 'Data' query must be a SELECT query");
        });

        it('should not allow to create a similarity index with invalid select query', () => {
            // Given I am on "Create similarity index" page.
            // When I fill similarity index name,
            SimilarityIndexCreateSteps.typeSimilarityIndexName('indexName');
            // and try to create index with update select query.
            YasqeSteps.pasteQuery(INVALID_QUERY);

            SimilarityIndexCreateSteps.create();

            // Then I expect see error message describes me, that select query must be a SELECT.
            ErrorSteps.verifyError("Invalid 'Data' query");
        });

        it('should not allow to create a similarity index without search query', () => {
            // Given I am on "Create similarity index" page.
            // When I fill similarity index name,
            SimilarityIndexCreateSteps.typeSimilarityIndexName('indexName');
            // and try to create index without search query.
            SimilarityIndexCreateSteps.switchToSearchQueryTab();
            YasqeSteps.clearEditor();
            SimilarityIndexCreateSteps.create();

            // Then I expect see error message describes me, that search query is mandatory.
            ErrorSteps.verifyError("The 'Search' query cannot be empty.");
        });

        it('should not allow to create a similarity index with search query', () => {
            // Given I am on "Create similarity index" page.
            // When I fill similarity index name,
            SimilarityIndexCreateSteps.typeSimilarityIndexName('indexName');
            // and try to create index with update search query.
            SimilarityIndexCreateSteps.switchToSearchQueryTab();
            YasqeSteps.pasteQuery(INSERT_QUERY);

            SimilarityIndexCreateSteps.create();

            // Then I expect see error message describes me, that search query must be a SELECT.
            ErrorSteps.verifyError("The 'Search' query must be a SELECT query");
        });

        it('should not allow to create a similarity index with invalid search query', () => {
            // Given I am on "Create similarity index" page.
            // When I fill similarity index name,
            SimilarityIndexCreateSteps.typeSimilarityIndexName('indexName');
            // and try to create index with update search query.
            SimilarityIndexCreateSteps.switchToSearchQueryTab();
            YasqeSteps.pasteQuery(INVALID_QUERY);

            SimilarityIndexCreateSteps.create();

            // Then I expect see error message describes me, that search query must be a SELECT.
            ErrorSteps.verifyError("Invalid 'Search' query");
        });

        it('should show error icon on top-right corner of tabs with invalid query', () => {
            // Given I am on "Create similarity index" page.
            // When I fill similarity index name,
            SimilarityIndexCreateSteps.typeSimilarityIndexName('indexName');
            // and try to create index with invalid select query.
            SimilarityIndexCreateSteps.switchToSearchQueryTab();
            YasqeSteps.pasteQuery(INVALID_QUERY);

            SimilarityIndexCreateSteps.create();

            // Then I expect to see an icon in the top-right corner of the 'Data query' tab.
            SimilarityIndexCreateSteps.getSearchQueryTab().find('.tab-error').should('exist');
        });
    });

    context('Validations for predication similarity index', () => {

        it('should not allow to create a similarity index without name', () => {
            // Given I am on "Create similarity index" page.
            // When I try to create a predication index.
            SimilarityIndexCreateSteps.switchToCreatePredictionIndexTab();
            SimilarityIndexCreateSteps.create();

            // Then I expect see error message describes me, that name is mandatory.
            ErrorSteps.verifyError('Index name cannot be empty');
        });

        it('should not allow to create a similarity index without select query', () => {
            // Given I am on "Create similarity index" page.
            // When I fill similarity index name,
            SimilarityIndexCreateSteps.switchToCreatePredictionIndexTab();
            SimilarityIndexCreateSteps.typeSimilarityIndexName('indexName');
            // and try to create index without select query.
            YasqeSteps.clearEditor();
            SimilarityIndexCreateSteps.create();

            // Then I expect see error message describes me, that select query is mandatory.
            ErrorSteps.verifyError("The 'Data' query cannot be empty.");
        });

        it('should not allow to create a similarity index with select query', () => {
            // Given I am on "Create similarity index" page.
            // When I fill similarity index name,
            SimilarityIndexCreateSteps.switchToCreatePredictionIndexTab();
            SimilarityIndexCreateSteps.typeSimilarityIndexName('indexName');
            // and try to create index with update select query.
            YasqeSteps.pasteQuery(INSERT_QUERY);

            SimilarityIndexCreateSteps.create();

            // Then I expect see error message describes me, that select query must be a SELECT.
            ErrorSteps.verifyError("The 'Data' query must be a SELECT query");
        });

        it('should not allow to create a similarity index with invalid select query', () => {
            // Given I am on "Create similarity index" page.
            // When I fill similarity index name,
            SimilarityIndexCreateSteps.switchToCreatePredictionIndexTab();
            SimilarityIndexCreateSteps.typeSimilarityIndexName('indexName');
            // and try to create index with update select query.
            YasqeSteps.pasteQuery(INVALID_QUERY);

            SimilarityIndexCreateSteps.create();

            // Then I expect see error message describes me, that select query must be a SELECT.
            ErrorSteps.verifyError("Invalid 'Data' query");
        });

        it('should not allow to create a similarity index without search query', () => {
            // Given I am on "Create similarity index" page.
            // When I fill similarity index name,
            SimilarityIndexCreateSteps.switchToCreatePredictionIndexTab();
            SimilarityIndexCreateSteps.typeSimilarityIndexName('indexName');
            // and try to create index without search query.
            SimilarityIndexCreateSteps.switchToSearchQueryTab();
            YasqeSteps.clearEditor();
            SimilarityIndexCreateSteps.create();

            // Then I expect see error message describes me, that select query is mandatory.
            ErrorSteps.verifyError("The 'Search' query cannot be empty.");
        });

        it('should not allow to create a similarity index with search query', () => {
            // Given I am on "Create similarity index" page.
            // When I fill similarity index name,
            SimilarityIndexCreateSteps.switchToCreatePredictionIndexTab();
            SimilarityIndexCreateSteps.typeSimilarityIndexName('indexName');
            // and try to create index with update search query.
            SimilarityIndexCreateSteps.switchToSearchQueryTab();
            YasqeSteps.pasteQuery(INSERT_QUERY);

            SimilarityIndexCreateSteps.create();

            // Then I expect see error message describes me, that select query must be a SELECT.
            ErrorSteps.verifyError("The 'Search' query must be a SELECT query");
        });

        it('should not allow to create a similarity index with invalid search query', () => {
            // Given I am on "Create similarity index" page.
            // When I fill similarity index name,
            SimilarityIndexCreateSteps.switchToCreatePredictionIndexTab();
            SimilarityIndexCreateSteps.typeSimilarityIndexName('indexName');
            // and try to create index with update search query.
            SimilarityIndexCreateSteps.switchToSearchQueryTab();
            YasqeSteps.pasteQuery(INVALID_QUERY);

            SimilarityIndexCreateSteps.create();

            // Then I expect see error message describes me, that select query must be a SELECT.
            ErrorSteps.verifyError("Invalid 'Search' query");
        });

        it('should not allow to create a similarity index without analogical query', () => {
            // Given I am on "Create similarity index" page.
            // When I fill similarity index name,
            SimilarityIndexCreateSteps.switchToCreatePredictionIndexTab();
            SimilarityIndexCreateSteps.typeSimilarityIndexName('indexName');
            // and try to create index without analogical query.
            SimilarityIndexCreateSteps.switchToAnalogicalQueryTab();
            YasqeSteps.clearEditor();
            SimilarityIndexCreateSteps.create();

            // Then I expect see error message describes me, that analogical query is mandatory.
            ErrorSteps.verifyError("The 'Analogical' query cannot be empty.");
        });

        it('should not allow to create a similarity index with analogical query', () => {
            // Given I am on "Create similarity index" page.
            // When I fill similarity index name,
            SimilarityIndexCreateSteps.switchToCreatePredictionIndexTab();
            // cy.pause()
            SimilarityIndexCreateSteps.typeSimilarityIndexName('indexName');
            // and try to create index with update analogical query.
            SimilarityIndexCreateSteps.switchToAnalogicalQueryTab();
            YasqeSteps.pasteQuery(INSERT_QUERY);

            SimilarityIndexCreateSteps.create();

            // Then I expect see error message describes me, that analogical query must be a SELECT.
            ErrorSteps.verifyError("The 'Analogical' query must be a SELECT query");
        });

        it('should not allow to create a similarity index with invalid analogical query', () => {
            // Given I am on "Create similarity index" page.
            // When I fill similarity index name,
            SimilarityIndexCreateSteps.switchToCreatePredictionIndexTab();
            SimilarityIndexCreateSteps.typeSimilarityIndexName('indexName');
            // and try to create index with update analogical query.
            SimilarityIndexCreateSteps.switchToAnalogicalQueryTab();
            YasqeSteps.pasteQuery(INVALID_QUERY);

            SimilarityIndexCreateSteps.create();

            // Then I expect see error message describes me, that analogical query must be a SELECT.
            ErrorSteps.verifyError("Invalid 'Analogical' query");
        });

        it('should show error icon on top-right corner of tabs with invalid query', () => {
            // Given I am on "Create similarity index" page.
            // When I fill similarity index name,
            SimilarityIndexCreateSteps.switchToCreatePredictionIndexTab();
            SimilarityIndexCreateSteps.typeSimilarityIndexName('indexName');
            // and try to create index with invalid analogical query.
            SimilarityIndexCreateSteps.switchToSearchQueryTab();
            YasqeSteps.pasteQuery(INVALID_QUERY);
            SimilarityIndexCreateSteps.switchToAnalogicalQueryTab();
            YasqeSteps.pasteQuery(INSERT_QUERY);

            SimilarityIndexCreateSteps.create();

            // Then I expect to see an icon in the top-right corner of the 'Data query' tab.
            SimilarityIndexCreateSteps.getSearchQueryTab().find('.tab-error').should('exist');
            SimilarityIndexCreateSteps.getAnalogicalQueryTab().find('.tab-error').should('exist');
        });
    });

    context('Validate value queries', () => {

        it('should fill correct queries when query tabs are changed', () => {
            // When I open the "Create similarity index" page.
            // Then I expect select query to be active.
            SimilarityIndexCreateSteps.checkSelectQueryTabActive();
            YasqeSteps.verifyQueryContains(DEFAULT_SELECT_QUERY);
            SimilarityIndexCreateSteps.switchToSearchQueryTab();
            YasqeSteps.verifyQueryContains(DEFAULT_SEARCH_QUERY);
            SimilarityIndexCreateSteps.switchToCreatePredictionIndexTab();
            SimilarityIndexCreateSteps.checkSelectQueryTabActive();
            YasqeSteps.verifyQueryContains(DEFAULT_PREDICATION_SELECT_QUERY);
            SimilarityIndexCreateSteps.switchToSearchQueryTab();
            YasqeSteps.verifyQueryContains(DEFAULT_PREDICATION_SEARCH_QUERY);
            SimilarityIndexCreateSteps.switchToAnalogicalQueryTab();
            YasqeSteps.verifyQueryContains(DEFAULT_ANALOGICAL_QUERY);
        });

        it('should not display query error if current displayed query is valid', () => {
            // When I open the "Create similarity index" page.
            // and type wrong select query.
            SimilarityIndexCreateSteps.typeSimilarityIndexName('indexName');
            YasqeSteps.pasteQuery('Wrong query');
            SimilarityIndexCreateSteps.create();

            // Then I expect see error message describes me, that select query is mandatory.
            ErrorSteps.verifyError("Invalid 'Data' query");

            // When I switch to search query tab.
            SimilarityIndexCreateSteps.switchToSearchQueryTab();

            // Then I expect to not see the error message.
            ErrorSteps.getErrorElement().should('not.exist');

        });
    });
});
