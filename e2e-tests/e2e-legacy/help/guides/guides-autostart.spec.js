import {GuideSteps} from '../../../steps/guides/guide-steps';
import {GuideDialogSteps} from '../../../steps/guides/guide-dialog-steps.js';
import {LoginSteps} from '../../../steps/login-steps.js';
import HomeSteps from '../../../steps/home-steps.js';

describe('Guides autostart', () => {
    const guideName = 'star-wars';

    describe('With security disabled', () => {
        it('Should autostart guide', () => {
            // Given, I visit the home page with autostart guide parameter in URL
            GuideSteps.autostartGuide(guideName);
            // Then, I should see the guide
            GuideSteps.assertPageNotInteractive();
            GuideDialogSteps.assertDialogWithTitleIsVisible(`Welcome to`);
        });
    });

    describe('With security enabled', () => {
        beforeEach(() => {
            cy.switchOnSecurity();
        });

        afterEach(() => {
            cy.loginAsAdmin();
            cy.switchOffSecurity(true);
        });

        context('admin', () => {
            it('Should autostart guide with admin', () => {
                // Given, I visit the home page with autostart guide parameter in URL
                GuideSteps.autostartGuide(guideName);
                // Then, I should see the login page and login with admin user
                LoginSteps.loginWithUser('admin', 'root');
                // Then, I should see the guide
                GuideSteps.assertPageNotInteractive();
                GuideDialogSteps.assertDialogWithTitleIsVisible(`Welcome to`);
            });
        });

        context('repo manager', () => {
            beforeEach(() => {
                cy.loginAsAdmin();
                cy.createUser({
                    username: 'repoManager',
                    password: 'root',
                    grantedAuthorities: ['ROLE_REPO_MANAGER', 'WRITE_REPO_*', 'READ_REPO_*'],
                }, true);
            });

            afterEach(() => {
                cy.deleteUser('repoManager', true);
            });

            it('Should autostart guide with repo manager', () => {
                // Given, I visit the home page with autostart guide parameter in URL
                GuideSteps.autostartGuide(guideName);
                // Then, I should see the login page and login with repo manager user
                LoginSteps.loginWithUser('repoManager', 'root');
                // Then, I should see the guide
                GuideSteps.assertPageNotInteractive();

                GuideDialogSteps.assertDialogWithTitleIsVisible(`Welcome to`);
            });
        });

        context('user', () => {
            beforeEach(() => {
                cy.loginAsAdmin();
                cy.createUser({
                    username: 'user',
                    password: 'root',
                    grantedAuthorities: ['WRITE_REPO_*', 'READ_REPO_*'],
                }, true);
            });

            afterEach(() => {
                cy.deleteUser('user', true);
            });

            it('Should not autostart guide with user', () => {
                // Given, I visit the home page with autostart guide parameter in URL
                GuideSteps.autostartGuide(guideName);
                // Then, I should see the login page and login with user
                LoginSteps.loginWithUser('user', 'root');
                // Then, I should not see the guide
                HomeSteps.getTutorialPanel().should('be.visible');
                GuideSteps.getGuidesModal().should('not.exist');
                GuideDialogSteps.getModalDialog().should('not.exist');
            });
        });
    });
});
