import {QueryStubs} from "../../../stubs/yasgui/query-stubs";
import {SparqlEditorSteps} from "../../../steps/sparql-editor-steps";
import {YasqeSteps} from "../../../steps/yasgui/yasqe-steps";
import {TablePluginSteps} from "../../../steps/yasgui/table-plugin-steps";

describe('Execute of update query', () => {

    let repositoryId;

    beforeEach(() => {
        repositoryId = 'sparql-editor-' + Date.now();
        QueryStubs.stubQueryCountResponse();
        cy.createRepository({id: repositoryId});
        cy.presetRepository(repositoryId);
        QueryStubs.stubDefaultQueryResponse(repositoryId);

        SparqlEditorSteps.visitSparqlEditorPage();
        YasqeSteps.getYasqe().should('be.visible');
    });

    afterEach(() => {
        cy.deleteRepository(repositoryId);
    });

    it('should display properly result message info when no one statement is added.', () => {
        // When I execute insert query which don't change repository statements
        YasqeSteps.pasteQuery(
                 'PREFIX : <http://bedrock/> ' +
                         'INSERT { ' +
                                  ':fred :hasSpouse :wilma. ' +
                                '} WHERE { ' +
                                   'rdf:name rdf:label "not_exist_label".' +
                                '}');
        YasqeSteps.executeQuery();

        // Then I expect result message info to informs me that statements did not change.
        TablePluginSteps.getQueryResultInfo().contains('The number of statements did not change.');
    });
});
