import {SparqlEditorSteps} from "../../steps/sparql-editor-steps";
import {YasguiSteps} from "../../steps/yasgui/yasgui-steps";
import {LuceneConnectorSteps} from "../../steps/lucene-connector-steps";
import {ConnectorsStubs} from "../../stubs/yasgui/connectors-stubs";
import {YasqeSteps} from "../../steps/yasgui/yasqe-steps";
import {ErrorPluginSteps} from "../../steps/yasgui/plugin/error-plugin-steps";
import {TablePluginSteps} from "../../steps/yasgui/table-plugin-steps";

describe('Connectors - Lucene', () => {
    let repositoryId;

    beforeEach(() => {
        repositoryId = 'sparql-editor-' + Date.now();
        cy.intercept('GET', '/rest/monitor/query/count', {body: 0});
        cy.createRepository({id: repositoryId});
        cy.presetRepository(repositoryId);

        SparqlEditorSteps.visitSparqlEditorPage();
        YasguiSteps.getYasgui().should('be.visible');
    });

    afterEach(() => {
        cy.deleteRepository(repositoryId);
    });

    it('should display error message if connector not supported.', () => {
        // When I execute connector query which has not supported command.
        ConnectorsStubs.stubLuceneHasNotSupport();
        YasqeSteps.clearEditor();
        YasqeSteps.writeInEditor(LuceneConnectorSteps.getCreateConnectorQuery());
        YasqeSteps.executeQuery();

        // Then I expect error message to be displayed.
        ErrorPluginSteps.getErrorPluginBody().contains('No support for lucene-connector, lucene-connector connectors are not supported because the plugin Lucene is not active.');
    });

    it('should create Lucene connector.', () => {
        // When I execute create lucene connector query.
        YasqeSteps.clearEditor();
        YasqeSteps.writeInEditor(LuceneConnectorSteps.getCreateConnectorQuery());
        YasqeSteps.executeQuery();

        // Then I expect Lucene connector to be created.
        TablePluginSteps.getQueryResultInfo().contains('Created connector my_index');
    });

    it('should delete Lucene connector.', () => {
        // Given a lucene connector is created.
        YasqeSteps.clearEditor();
        YasqeSteps.writeInEditor(LuceneConnectorSteps.getCreateConnectorQuery());
        YasqeSteps.executeQuery();

        // Then I expect Lucene connector to be created.
        // This check is used to be sure that connector is created.
        TablePluginSteps.getQueryResultInfo().contains('Created connector my_index');

        // When I execute delete lucene connector query.
        YasqeSteps.clearEditor();
        YasqeSteps.writeInEditor(LuceneConnectorSteps.getDeleteConnectorSteps());
        YasqeSteps.executeQuery();

        // Then I expect Lucene connector to be created.
        TablePluginSteps.getQueryResultInfo().contains('Deleted connector my_index');
    });
});
