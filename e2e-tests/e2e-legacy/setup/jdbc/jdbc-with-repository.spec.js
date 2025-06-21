import HomeSteps from "../../../steps/home-steps";
import {MainMenuSteps} from "../../../steps/main-menu-steps";
import {JdbcSteps} from "../../../steps/setup/jdbc-steps";

describe('JDBC with selected repository', () => {
    let repositoryId;

    beforeEach(() => {
        repositoryId = 'jdbc-init-' + Date.now();
        cy.createRepository({id: repositoryId});
        cy.presetRepository(repositoryId);
    });

    afterEach(() => {
        cy.deleteRepository(repositoryId);
    });

    it('Should display the correct initial state when navigating via URL', () => {
        // Given, I visit the JDBC page via URL with a repository selected
        JdbcSteps.visit();
        // Then,
        verifyInitialStateWithSelectedRepository();
    });

    it('Should display the correct initial state when navigating via the navigation bar', () => {
        // Given, I visit the JDBC page via the navigation menu with a repository selected
        HomeSteps.visit();
        MainMenuSteps.clickOnJDBC();
        // Then,
        verifyInitialStateWithSelectedRepository();
    });

    const verifyInitialStateWithSelectedRepository = () => {
        JdbcSteps.getJDBCPage().should('exist');
        JdbcSteps.getJDBCConfiguration().should('exist');
        JdbcSteps.getCreateSQLTableConfigurationButton().should('exist');
        JdbcSteps.getNoSQLConfigurationsMessage().should('exist');
    };
})
