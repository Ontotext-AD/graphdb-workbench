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

    static getAbortButtons() {
        return this.getQueryAndUpdatePage().getByTestId('monitoring-queries-abort-button');
    }

    // A real hover: the popover's jQuery mouseenter handler ignores a synthetic mouseenter.
    static hoverAbortButton(index) {
        this.getQueryAndUpdatePage().getByTestId('monitoring-queries-abort-popover-trigger').eq(index).realHover();
    }

    static getNoRunningQueriesOrUpdates() {
        return this.getQueryAndUpdatePage().getByTestId('no-running-queries-or-updates-alert');
    }
}
