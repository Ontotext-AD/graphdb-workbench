import {BaseSteps} from "../base-steps";

export class QueriesAndUpdatesSteps extends BaseSteps {

    static visit() {
        super.visit('/monitor/queries');
    }

    static getQueryAndUpdatePage() {
        return super.getByTestId('monitoring-queries-and-updates');
    }

    static getPauseButton() {
        return this.getQueryAndUpdatePage().getByTestId('pause-button');
    }

    static getNoRunningQueriesOrUpdates() {
        return this.getQueryAndUpdatePage().getByTestId('no-running-queries-or-updates-alert');
    }
}
