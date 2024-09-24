import {Stubs} from "./stubs";

export class ConnectorStubs extends Stubs {
    static stubGetConnectors() {
        this.stubQueryResponse('/rest/connectors', '/connectors/get-connectors.json', 'get-connectors');
    }

    static stubGetRetrievalConnector(fixture = `/connectors/get-retrieval-connector.json`) {
        this.stubQueryResponse(
            `/rest/connectors/existing?prefix=http%3A%2F%2Fwww.ontotext.com%2Fconnectors%2Fretrieval%23`,
            fixture,
            'get-connector'
        );
    }
}
