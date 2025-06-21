import {ErrorSteps} from "../../../steps/error-steps";
import HomeSteps from "../../../steps/home-steps";
import {MainMenuSteps} from "../../../steps/main-menu-steps";
import {JdbcSteps} from "../../../steps/setup/jdbc-steps";

describe('JDBC without selected repository', () => {
    it('Should display the correct initial state when navigating via URL', () => {
        // Given, I visit the JDBC page via URL without a repository selected
        JdbcSteps.visit();
        // Then,
        verifyInitialStateWithoutSelectedRepository();
    });

    it('Should display the correct initial state when navigating via the navigation menu', () => {
        // Given, I visit the JDBC page via the navigation menu without a repository selected
        HomeSteps.visit();
        MainMenuSteps.clickOnJDBC();
        // Then,
        verifyInitialStateWithoutSelectedRepository();
    });

    const verifyInitialStateWithoutSelectedRepository = () => {
        ErrorSteps.verifyNoConnectedRepoMessage();
        JdbcSteps.getJDBCPage().should('exist');
        JdbcSteps.getJDBCConfiguration().should('not.exist');
    };
})
