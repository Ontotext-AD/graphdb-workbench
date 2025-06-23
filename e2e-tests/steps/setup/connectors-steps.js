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
}
