import {QueryStubs} from "../../../stubs/yasgui/query-stubs";
import {SparqlEditorSteps} from "../../../steps/sparql-editor-steps";
import {YasguiSteps} from "../../../steps/yasgui/yasgui-steps";
import {YasqeSteps} from "../../../steps/yasgui/yasqe-steps";
import {TablePluginSteps} from "../../../steps/yasgui/table-plugin-steps";

describe('Execute of update query', () => {

    let repositoryId;

    beforeEach(() => {
        repositoryId = 'sparql-editor-' + Date.now();
        cy.intercept('GET', '/rest/monitor/query/count', {body: 0});
        cy.createRepository({id: repositoryId});
        cy.presetRepository(repositoryId);
        QueryStubs.stubDefaultQueryResponse(repositoryId);

        SparqlEditorSteps.visitSparqlEditorPage();
        YasguiSteps.getYasgui().should('be.visible');
    });

    afterEach(() => {
        cy.deleteRepository(repositoryId);
    });

    it('should display properly result message info when no one statement is added.', () => {
        // When I execute insert query which don't change repository statements
        YasqeSteps.clearEditor();
        YasqeSteps.writeInEditor(
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

    it('should display properly result message info when insert 2 statements', () => {
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

    it('should display result message info which describes that two statements are removed', () => {
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
