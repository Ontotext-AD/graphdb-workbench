import HomeSteps from '../../../steps/home-steps.js';
import {DeprecationSteps} from '../../../steps/deprecation-steps.js';
import {LoginSteps} from '../../../steps/login-steps.js';
import {GuidesStubs} from '../../../stubs/guides/guides-stubs.js';
import {GuideSteps} from '../../../steps/guides/guide-steps.js';
import {GuideDialogSteps} from '../../../steps/guides/guide-dialog-steps.js';

describe('Solr deprecation banner', () => {
    context('Security disabled', () => {
        it('should keep the Solr deprecation banner hidden after the anonymous user dismisses it', () => {
            // GIVEN: I have opened the application with security disabled.
            HomeSteps.visit();

            // THEN: I expect the Solr deprecation banner to be visible.
            DeprecationSteps.getDeprecationBanner()
                .should('be.visible')
                .should('contain.text', 'The Solr connector is deprecated and will be removed in GraphDB 12');

            // WHEN: I dismiss the Solr deprecation banner.
            DeprecationSteps.closeBanner();
            // THEN: I expect the Solr deprecation banner to be hidden.
            DeprecationSteps.getDeprecationBanner().should('not.exist');

            // WHEN: I reload the application.
            HomeSteps.visit();
            // THEN: I expect the Solr deprecation banner to remain hidden.
            DeprecationSteps.getDeprecationBanner().should('not.exist');
        });
    });

    context('Security enabled', () => {
        const PASSWORD = 'root';
        const USER_USERNAME = 'username';

        beforeEach(() => {
            cy.createUser({
                username: USER_USERNAME,
                password: PASSWORD
            });

            cy.switchOnSecurity()
                .then(() => cy.loginAsAdmin())
                .then(() => cy.switchOnFreeAccess(true));
        });

        afterEach(() => {
            cy.loginAsAdmin()
                .then(() => {
                    cy.deleteUser(USER_USERNAME, true);
                    cy.switchOffFreeAccess(true);
                    cy.switchOffSecurity(true);
                });
        });

        it('should persist separate Solr banner states for anonymous and logged-in users', () => {
            // GIVEN: Security and free access are enabled, and no user is logged in.
            HomeSteps.visit();

            // THEN: I expect the Solr deprecation banner to be visible for the anonymous user.
            DeprecationSteps.getDeprecationBanner()
                .should('be.visible')
                .should('contain.text', 'The Solr connector is deprecated and will be removed in GraphDB 12');

            // WHEN: The anonymous user dismisses the banner.
            DeprecationSteps.closeBanner();
            // THEN: I expect the banner to be hidden for the anonymous user.
            DeprecationSteps.getDeprecationBanner().should('not.exist');

            // WHEN: I log in as a user who has not dismissed the banner.
            cy.loginAs(USER_USERNAME, PASSWORD);
            HomeSteps.visit();

            // THEN: I expect the banner to be visible for the logged-in user.
            DeprecationSteps.getDeprecationBanner()
                .should('be.visible')
                .should('contain.text', 'The Solr connector is deprecated and will be removed in GraphDB 12');

            // WHEN: The logged-in user dismisses the banner.
            DeprecationSteps.closeBanner();
            // THEN: I expect the banner to be hidden for the logged-in user.
            DeprecationSteps.getDeprecationBanner().should('not.exist');

            // WHEN: The user logs out.
            LoginSteps.logout();
            // THEN: I expect the banner to remain hidden because the anonymous user has already dismissed it.
            DeprecationSteps.getDeprecationBanner().should('not.exist');

            // WHEN: I log in as the administrator, who has not dismissed the banner.
            cy.loginAs('admin', 'root');
            HomeSteps.visit();
            // THEN: I expect the banner to be visible for the administrator.
            DeprecationSteps.getDeprecationBanner()
                .should('be.visible')
                .should('contain.text', 'The Solr connector is deprecated and will be removed in GraphDB 12');

            // WHEN: The administrator logs out.
            LoginSteps.logout();
            // THEN: I expect the banner to remain hidden because the anonymous user has already dismissed it.
            DeprecationSteps.getDeprecationBanner().should('not.exist');

            // WHEN: I log in again as the user who previously dismissed the banner.
            cy.loginAs(USER_USERNAME, PASSWORD);
            HomeSteps.visit();
            // THEN: I expect the banner to remain hidden for the logged-in user.
            DeprecationSteps.getDeprecationBanner().should('not.exist');
        });
    });

    context('User guides', () => {
        it.only('should hide the Solr deprecation banner while a guide is running', () => {
            // GIVEN: The guides are loaded and ready to be started.
            GuidesStubs.stubMainMenuGuide();
            GuideSteps.visit();
            GuideSteps.verifyGuidesListExists();
            cy.wait('@getGuides');

            // WHEN: I am on an application page, and the Solr deprecation banner has not been dismissed by the current user.
            // THEN: I expect the Solr deprecation banner to be visible because it has not been dismissed by the current user.
            DeprecationSteps.getDeprecationBanner()
                .should('be.visible')
                .should('contain.text', 'The Solr connector is deprecated and will be removed in GraphDB 12');

            // WHEN: I start a guide.
            GuideSteps.runFirstGuide();
            // THEN: I expect the Solr deprecation banner to be hidden while the guide is running.
            DeprecationSteps.getDeprecationBanner().should('not.exist');

            // WHEN: I cancel the guide.
            GuideDialogSteps.clickOnCancelButton();
            GuideDialogSteps.clickConfirmCancelDialogExitButton();
            // THEN: I expect the Solr deprecation banner to be visible again.
            DeprecationSteps.getDeprecationBanner()
                .should('be.visible')
                .should('contain.text', 'The Solr connector is deprecated and will be removed in GraphDB 12');
        });
    });
});
