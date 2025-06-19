import HomeSteps from "../../../steps/home-steps";
import {MainMenuSteps} from "../../../steps/main-menu-steps";
import {SystemMonitoringSteps} from "../../../steps/monitoring/system-monitoring-steps";

describe('System monitoring with selected repository', () => {
    let repositoryId;

    beforeEach(() => {
        repositoryId = 'system-monitoring-init-' + Date.now();
        cy.createRepository({id: repositoryId});
        cy.presetRepository(repositoryId);
    });

    afterEach(() => {
        cy.deleteRepository(repositoryId);
    });

    it('Should display the correct initial state when navigating via URL', () => {
        // Given, I visit the System monitoring page via URL with a repository selected
        SystemMonitoringSteps.visit();
        // Then,
        SystemMonitoringSteps.verifyInitialStateWithSelectedRepository();
    });

    it('Should display the correct initial state when navigating via the navigation bar', () => {
        // Given, I visit the System monitoring page via the navigation menu with a repository selected
        HomeSteps.visit();
        MainMenuSteps.clickOnSystemMonitoring();
        // Then,
        SystemMonitoringSteps.verifyInitialStateWithSelectedRepository();
    });
})
