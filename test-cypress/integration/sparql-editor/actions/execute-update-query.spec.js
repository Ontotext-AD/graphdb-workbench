import {QueryStubs} from "../../../stubs/yasgui/query-stubs";
import {SparqlEditorSteps} from "../../../steps/sparql-editor-steps";
import {YasguiSteps} from "../../../steps/yasgui/yasgui-steps";
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

    it('should display properly result message info when insert 2 statements', {
        retries: {
            runMode: 1,
            openMode: 0
        }
    }, () => {
        // When I execute insert query which adds 2 results
        YasqeSteps.pasteQuery(
                 'PREFIX : <http://bedrock/> ' +
                         'INSERT DATA { ' +
                            ':fred :hasSpouse :wilma.' +
                            ':fred :hasChild :pebbles.' +
                         '}');
        YasqeSteps.executeQuery();

        // Then I expect result message info to informs me that 2 statements have been added.
        TablePluginSteps.getQueryResultInfo().contains('Added 2 statements.');
    });
});
