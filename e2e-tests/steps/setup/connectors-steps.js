import {BaseSteps} from "../base-steps";

export class ConnectorsSteps extends BaseSteps {
    static visit() {
        super.visit('/connectors');
    }

    static getConnectorsPage() {
        return this.getByTestId('connectors-page');
    }

    static getConnectorButton(buttonId) {
        return this.getConnectorsPage().getByTestId(`connector-${buttonId}`);
    }

    static getReloadAllButton() {
        return this.getConnectorsPage().getByTestId('reload-all-connectors');
    }

    static expandConnector(connectorName, instanceName) {
        this.getByTestId(`connector-name-${connectorName}`).getByTestId(`${instanceName}-connector-toggle-button`).find('a').click();
    }

    static viewSPARQLQuery(connectorName, instanceName) {
        const connectorContent = this.getByTestId(`connector-name-${connectorName}`).getByTestId(`${instanceName}-connector-content`);
        connectorContent.getByTestId('open-view-sparql-query-dialog').click();
    }

    static closeSPARQLQueryDialog() {
        this.getByTestId('close-view-query-dialog').click();
    }
}
