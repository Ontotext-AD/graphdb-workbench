import HomeSteps from "../../../steps/home-steps";
import {MainMenuSteps} from "../../../steps/main-menu-steps";
import {SystemMonitoringSteps} from "../../../steps/monitoring/system-monitoring-steps";

describe('System monitoring without selected repository', () => {
    it('Should display the correct initial state when navigating via URL', () => {
        // Given, I visit the System monitoring page via URL without a repository selected
        SystemMonitoringSteps.visit();
        // Then,
        SystemMonitoringSteps.verifyInitialStateWithSelectedRepository();
    });

    it('Should display the correct initial state when navigating via the navigation menu', () => {
        // Given, I visit the System monitoring page via the navigation menu without a repository selected
        HomeSteps.visit();
        MainMenuSteps.clickOnSystemMonitoring();
        // Then,
        SystemMonitoringSteps.verifyInitialStateWithSelectedRepository();
    });
})
