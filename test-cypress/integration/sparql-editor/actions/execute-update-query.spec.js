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
        YasqeSteps.clearEditor();
        YasqeSteps.writeInEditor(
                 'PREFIX : <http://bedrock/> ' +
                         'INSERT DATA { ' +
                            ':fred :hasSpouse :wilma.' +
                            ':fred :hasChild :pebbles.' +
                         '}');
        YasqeSteps.executeQuery();

        // Then I expect result message info to informs me that 2 statements have been added.
        TablePluginSteps.getQueryResultInfo().contains('Added 2 statements.');
    });

    it('should display result message info which describes that two statements are removed', {
        retries: {
            runMode: 1,
            openMode: 0
        }
    }, () => {
        // When I visit a page with "ontotext-yasgui-web-component" in it,
        // and selected repository has some inserted statements.
        YasqeSteps.clearEditor();
        YasqeSteps.writeInEditor(
            'PREFIX : <http://bedrock/> ' +
                    'INSERT DATA { ' +
                         ':fred :hasSpouse :wilma.' +
                         ':fred :hasChild :pebbles.' +
                    '}');
        YasqeSteps.executeQuery();
        // Wait statements to be inserted.
        TablePluginSteps.getQueryResultInfo().contains('Added 2 statements.');

        // When I execute delete query which removes 2 results
        YasqeSteps.clearEditor();
        YasqeSteps.writeInEditor(
            'PREFIX : <http://bedrock/> ' +
                    'DELETE DATA { ' +
                         ':fred :hasSpouse :wilma.' +
                         ':fred :hasChild :pebbles.' +
                    '}');
        YasqeSteps.executeQuery();

        // Then I expect result message info to informs me that 2 statements have been added.
        TablePluginSteps.getQueryResultInfo().contains('Removed 2 statements.');
    });
});
