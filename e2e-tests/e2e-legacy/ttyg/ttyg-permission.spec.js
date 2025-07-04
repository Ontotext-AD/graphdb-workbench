import {RepositoriesStubs} from "../../stubs/repositories/repositories-stubs";
import {RepositoriesStub} from "../../stubs/repositories-stub";
import {UserAndAccessSteps} from "../../steps/setup/user-and-access-steps";
import {TTYGStubs} from "../../stubs/ttyg/ttyg-stubs";
import {TTYGViewSteps} from "../../steps/ttyg/ttyg-view-steps";
import {LoginSteps} from "../../steps/login-steps";

const USER_WITH_ROLE_USER = 'ttyg_user';
const USER_WITH_ROLE_REPO_MANAGER = 'ttyg_repo_manager';
const USER_ADMINISTRATOR = 'admin';
const PASSWORD = 'root';
const ENABLED = true;
const DISABLED = false;

describe('TTYG permissions', () => {


    before(() => {
        RepositoriesStubs.stubRepositories(0, '/repositories/get-ttyg-repositories.json');
        RepositoriesStub.stubBaseEndpoints('starwars');
        cy.loginAsAdmin();
        cy.presetRepository('starwars');
        cy.createUser({username: USER_WITH_ROLE_USER, password: PASSWORD});
        cy.createUser({
            username: USER_WITH_ROLE_REPO_MANAGER,
            password: PASSWORD,
            grantedAuthorities: ["ROLE_REPO_MANAGER", "WRITE_REPO_*", "READ_REPO_*"]
        });
        cy.switchOnSecurity();
    });

    after(() => {
        cy.loginAsAdmin();
        cy.deleteUser(USER_WITH_ROLE_USER, true);
        cy.deleteUser(USER_WITH_ROLE_REPO_MANAGER, true);
        cy.switchOffSecurity(true);
    });

    it('should disable all buttons that can modify the agent', () => {

        // When I log in with a user who has the ROLE_USER role, I expect all buttons modifying the agent to be disabled.
        verifyCanCreateAgentForFirstTime(USER_WITH_ROLE_USER, PASSWORD, DISABLED);

        // When I log in with a user who has the ROLE_REPO_MANAGER role, I expect all buttons modifying the agent to be enabled.
        verifyCanCreateAgentForFirstTime(USER_WITH_ROLE_REPO_MANAGER, PASSWORD, ENABLED);

        // When I log in with a user who is administrator, I expect all buttons modifying the agent to be enabled.
        verifyCanCreateAgentForFirstTime(USER_ADMINISTRATOR, PASSWORD, ENABLED);
    });

    function verifyCanCreateAgentForFirstTime(user, password, enable) {
        const shouldBe = enable ? 'be.enabled' : 'be.disabled';
        TTYGStubs.stubAgentListGet('/ttyg/agent/get-agent-list-0.json');
        TTYGViewSteps.visit();
        LoginSteps.loginWithUser(user, password);
        TTYGViewSteps.getCreateFirstAgentButton().should(shouldBe);
        TTYGStubs.stubChatsListGet();
        TTYGStubs.stubAgentListGet();
        TTYGStubs.stubChatGet();
        TTYGViewSteps.visit();
        TTYGViewSteps.getCreateAgentButton().should(shouldBe);
        TTYGViewSteps.getEditCurrentAgentButton().should(shouldBe);
        TTYGViewSteps.getToggleAgentsSidebarButton().should(shouldBe);
        LoginSteps.logout();
    }
});
