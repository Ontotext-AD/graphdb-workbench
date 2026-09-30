import {ReactodiaSteps} from '../../steps/reactodia-steps.js';
import {PageRestrictionsSteps} from '../../steps/page-restrictions-steps.js';
import {RepositoryPickerListSteps} from '../../steps/repository-picker-list-steps.js';
import {LicenseStubs} from '../../stubs/license-stubs.js';
import {RepositorySteps} from '../../steps/repository-steps.js';

const NO_REPOSITORY_MESSAGE = 'you are not connected to any repository';
const INVALID_LICENSE_MESSAGE = 'your license is not valid';
const SELECT_OR_CREATE_REPOSITORY_MESSAGE = 'Select a repository below or create a new one.';
const SELECT_REPOSITORY_MESSAGE = 'Select a repository below.';

describe('Reactodia view restrictions', () => {
    let repositoryId;

    beforeEach(() => {
        repositoryId = 'reactodia-view-restrictions-' + Date.now();
        cy.createRepository({id: repositoryId});
    });

    afterEach(() => {
        cy.deleteRepository(repositoryId);
    });

    it('should show the repository picker when no repository is selected', () => {
        // GIVEN no repository is selected

        // WHEN I open the Reactodia view
        ReactodiaSteps.visit();
        // THEN I expect the repository restriction is shown
        PageRestrictionsSteps.getMessages().should('have.length', 1);
        PageRestrictionsSteps.getMessage(NO_REPOSITORY_MESSAGE).should('be.visible');
        // AND the existing repository is available in the picker
        RepositoryPickerListSteps.getRepositoryRow(repositoryId).should('be.visible');
        // AND the graph is not rendered
        ReactodiaSteps.getComponent().should('not.exist');
    });

    it('should render the graph when a repository is selected from the picker', () => {
        // GIVEN the Reactodia view is open with no repository selected
        ReactodiaSteps.visit();

        // WHEN I select a repository
        RepositoryPickerListSteps.selectRepository(repositoryId);
        // THEN I expect the restriction is removed and the graph is rendered
        PageRestrictionsSteps.getRestrictions().should('not.exist');
        ReactodiaSteps.getWorkspace().should('exist');
    });

    it('should not restrict the view when the license is valid and a repository is selected', () => {
        // GIVEN a valid license and a selected repository
        cy.presetRepository(repositoryId);

        // WHEN I open the Reactodia view
        ReactodiaSteps.visit();
        // THEN I expect the view is not restricted
        ReactodiaSteps.getWorkspace().should('exist');
        PageRestrictionsSteps.getRestrictions().should('not.exist');
    });

    context('when the license is invalid', () => {
        beforeEach(() => {
            LicenseStubs.stubNoValidLicense();
        });

        it('should show the license restriction when a repository is selected', () => {
            // GIVEN an invalid license and a selected repository
            cy.presetRepository(repositoryId);

            // WHEN I open the Reactodia view
            ReactodiaSteps.visit();
            // THEN I expect the license restriction is shown
            PageRestrictionsSteps.getMessages().should('have.length', 1);
            PageRestrictionsSteps.getMessage(INVALID_LICENSE_MESSAGE).should('be.visible');
            // AND the "Set a new license" link is displayed
            PageRestrictionsSteps.getInternalLink()
                .should('contain.text', 'Set a new license')
                .and('have.attr', 'href')
                .and('include', '/license');
            // AND the repository picker and graph are not rendered
            RepositoryPickerListSteps.getRepositoryPickerList().should('not.exist');
            ReactodiaSteps.getComponent().should('not.exist');
        });

        it('should show both restrictions when no repository is selected', () => {
            // GIVEN an invalid license and no repository selected

            // WHEN I open the Reactodia view
            ReactodiaSteps.visit();
            // THEN both restrictions are shown
            PageRestrictionsSteps.getMessages().should('have.length', 2);
            PageRestrictionsSteps.getMessage(INVALID_LICENSE_MESSAGE).should('be.visible');
            PageRestrictionsSteps.getMessage(NO_REPOSITORY_MESSAGE)
                .should('be.visible')
                .and('not.contain.text', 'create a new one');
            // AND the existing repository is available, but repository creation is not
            RepositoryPickerListSteps.getRepositoryRow(repositoryId).should('be.visible');
            RepositoryPickerListSteps.getCreateRepositoryButton().should('not.exist');
            // AND the graph is not rendered
            ReactodiaSteps.getComponent().should('not.exist');
        });
    });

    context('with security enabled', () => {
        const readOnlyUser = 'reactodia-reader-' + Date.now();
        const repoManagerUser = 'reactodia-repo-manager-' + Date.now();
        const repoMaintainerUser = 'reactodia-repo-maintainer-' + Date.now();
        const password = 'root';

        beforeEach(() => {
            cy.createUser({
                username: readOnlyUser,
                password,
                grantedAuthorities: ['ROLE_USER', `READ_REPO_${repositoryId}`]
            });
            cy.createUser({
                username: repoManagerUser,
                password,
                grantedAuthorities: ['ROLE_USER', 'ROLE_REPO_MANAGER']
            });
            cy.createUser({
                username: repoMaintainerUser,
                password,
                grantedAuthorities: [
                    'ROLE_USER',
                    `READ_REPO_${repositoryId}`,
                    `WRITE_REPO_${repositoryId}`,
                    `MAINTAIN_REPO_${repositoryId}`
                ]
            });
            cy.switchOnSecurity();
        });

        afterEach(() => {
            cy.loginAsAdmin().then(() => {
                cy.deleteUser(readOnlyUser, true);
                cy.deleteUser(repoManagerUser, true);
                cy.deleteUser(repoMaintainerUser, true);
                cy.switchOffSecurity(true);
            });
        });

        it('should not restrict the view for a user without write permission', () => {
            // GIVEN a user with read-only access to the selected repository
            cy.loginAs(readOnlyUser, password);
            cy.presetRepository(repositoryId);

            // WHEN I open the Reactodia view
            ReactodiaSteps.visit();
            // THEN I expect the view is not restricted
            ReactodiaSteps.getWorkspace().should('exist');
            PageRestrictionsSteps.getRestrictions().should('not.exist');
        });

        it('should offer repository creation to the administrator', () => {
            // GIVEN the administrator is logged in with no repository selected
            cy.loginAs('admin', password);

            // WHEN I open the Reactodia view
            ReactodiaSteps.visit();
            // THEN I expect the option to select or create a repository is displayed
            PageRestrictionsSteps.getMessage(SELECT_OR_CREATE_REPOSITORY_MESSAGE).should('be.visible');
            RepositoryPickerListSteps.getRepositoryRow(repositoryId).should('be.visible');
            RepositoryPickerListSteps.getCreateRepositoryButton().should('be.visible');
        });

        it('should offer repository creation to a repository manager', () => {
            // GIVEN a repository manager is logged in with no repository selected
            cy.loginAs(repoManagerUser, password);

            // WHEN I open the Reactodia view
            ReactodiaSteps.visit();
            // THEN the option to select or create a repository is displayed
            PageRestrictionsSteps.getMessage(SELECT_OR_CREATE_REPOSITORY_MESSAGE).should('be.visible');
            RepositoryPickerListSteps.getRepositoryRow(repositoryId).should('be.visible');

            // WHEN I click the create repository button
            RepositoryPickerListSteps.clickCreateRepositoryButton();
            // THEN the create repository view is opened
            RepositorySteps.verifyRepositoryCreateViewUrl().and('include', 'previous=%2Freactodia');
        });

        [
            {role: 'a read-only user', username: readOnlyUser},
            {role: 'a repository maintainer', username: repoMaintainerUser},
        ].forEach(({role, username}) => {
            it(`should not offer repository creation to ${role}`, () => {
                // GIVEN a user without repository management rights is logged in with no repository selected
                cy.loginAs(username, password);

                // WHEN I open the Reactodia view
                ReactodiaSteps.visit();
                // THEN only the option to select a repository is displayed
                PageRestrictionsSteps.getMessage(SELECT_REPOSITORY_MESSAGE).should('be.visible');
                PageRestrictionsSteps.getMessages().should('not.contain.text', 'create a new one');
                RepositoryPickerListSteps.getRepositoryRow(repositoryId).should('be.visible');
                RepositoryPickerListSteps.getCreateRepositoryButton().should('not.exist');
            });
        });
    });
});
