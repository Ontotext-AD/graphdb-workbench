import {SparqlEditorSteps} from "../../steps/sparql-editor-steps";
import {LuceneConnectorSteps} from "../../steps/lucene-connector-steps";
import {ConnectorsStubs} from "../../stubs/yasgui/connectors-stubs";
import {YasqeSteps} from "../../steps/yasgui/yasqe-steps";
import {ErrorPluginSteps} from "../../steps/yasgui/plugin/error-plugin-steps";
import {TablePluginSteps} from "../../steps/yasgui/table-plugin-steps";
import {QueryStubs} from "../../stubs/yasgui/query-stubs";

describe('Connectors - Lucene', () => {
    let repositoryId;

    beforeEach(() => {
        repositoryId = 'sparql-editor-' + Date.now();
        QueryStubs.stubQueryCountResponse();
        cy.createRepository({id: repositoryId});
        cy.presetRepository(repositoryId);

        SparqlEditorSteps.visitSparqlEditorPage();
        YasqeSteps.getEditor().should('be.visible');
    });

    afterEach(() => {
        cy.deleteRepository(repositoryId);
    });

    it('should display error message if connector not supported.', () => {
        // When I execute connector query which has not supported command.
        ConnectorsStubs.stubLuceneHasNotSupport();
        YasqeSteps.pasteQuery(LuceneConnectorSteps.getCreateConnectorQuery());
        YasqeSteps.executeErrorQuery();

        // Then I expect error message to be displayed.
        ErrorPluginSteps.getErrorPluginBody().contains('No support for lucene-connector, lucene-connector connectors are not supported because the plugin Lucene is not active.');
    });

    it('should create Lucene connector.', () => {
        // When I execute create lucene connector query.
        YasqeSteps.pasteQuery(LuceneConnectorSteps.getCreateConnectorQuery('my_index'));
        YasqeSteps.executeQueryWithoutWaiteResult();

        // Then I expect Lucene connector to be created.
        TablePluginSteps.getQueryResultInfo().contains('Created connector my_index');
    });

    it('should delete Lucene connector.', () => {
        const connectorName = 'connector_to_be_deleted';
        // Given a lucene connector is created.
        YasqeSteps.pasteQuery(LuceneConnectorSteps.getCreateConnectorQuery(connectorName));
        YasqeSteps.executeQuery();

        // Then I expect Lucene connector to be created.
        // This check is used to be sure that connector is created.
        TablePluginSteps.getQueryResultInfo().contains(`Created connector ${connectorName}`);

        // When I execute delete lucene connector query.
        YasqeSteps.pasteQuery(LuceneConnectorSteps.getDeleteConnectorSteps(connectorName));
        YasqeSteps.executeQuery();

        // Then I expect Lucene connector to be created.
        TablePluginSteps.getQueryResultInfo().contains(`Deleted connector ${connectorName}`);
    });
});
