import {GuideSteps} from "../../../steps/guides/guide-steps.js";
import {GuideDialogSteps} from "../../../steps/guides/guide-dialog-steps.js";
import {GuidesStubs} from "../../../stubs/guides/guides-stubs.js";

describe('Confirm cancel dialog', () => {
    it('Should open confirm cancel dialog', () => {
        GuidesStubs.stubWelcomGuide();
        GuideSteps.visit();
        GuideSteps.verifyGuidesListExists();
        cy.wait('@getGuides');

        // Given, I start a guide
        GuideSteps.runFirstGuide();
        GuideSteps.assertPageNotInteractive();
        GuideDialogSteps.assertDialogWithTitleIsVisible(`Welcome to`);

        // When, I try to cancel the guide
        GuideDialogSteps.clickOnCancelButton();

        // Then, I should see a confirm cancel dialog
        GuideDialogSteps.getConfirmCancelDialog().should('be.visible');
        GuideDialogSteps.getModalDialog().should('not.exist');

        // When I press the cancel button
        GuideDialogSteps.clickConfirmCancelDialogCancelButton();

        // Then, I should see the guide dialog again as I didn't cancel it
        GuideDialogSteps.getModalDialog().should('be.visible');
        GuideDialogSteps.assertDialogWithTitleIsVisible(`Welcome to`);

        // When I press the cancel dialog again
        GuideDialogSteps.clickOnCancelButton();
        GuideDialogSteps.getConfirmCancelDialog().should('be.visible');
        GuideDialogSteps.getModalDialog().should('not.exist');

        // And click on the close (X) icon button
        GuideDialogSteps.clickOnConfirmCancelDialogCloseButton();

        // Then, I should see the guide again as I didn't cancel it
        GuideDialogSteps.getModalDialog().should('be.visible');
        GuideDialogSteps.assertDialogWithTitleIsVisible(`Welcome to`);

        // When I try to cancel it a third time
        GuideDialogSteps.clickOnCancelButton();
        GuideDialogSteps.getConfirmCancelDialog().should('be.visible');
        GuideDialogSteps.getModalDialog().should('not.exist');

        // And click on exit
        GuideDialogSteps.clickConfirmCancelDialogExitButton();

        // Then, I should see the guides list and no active guide as I canceled it
        GuideDialogSteps.getModalDialog().should('not.exist');
        GuideDialogSteps.getConfirmCancelDialog().should('not.exist');
    });

    it('Should disable autostart when don\'t show again is pressed', () => {
        const guideName = 'star-wars';
        // Given, I visit the home page with autostart guide parameter in URL
        GuideSteps.autostartGuide(guideName);
        // Then, I should see the guide
        GuideSteps.assertPageNotInteractive();
        GuideDialogSteps.assertDialogWithTitleIsVisible(`Welcome to`);

        // When I try to cancel the dialog
        GuideDialogSteps.clickOnCancelButton();

        // Then, I should see a confirm cancel dialog with "Don't show again" button
        GuideDialogSteps.getConfirmCancelDialog().should('be.visible');
        GuideDialogSteps.getConfirmCancelDialogDontShowAgainButton().should('be.visible');

        // When I click on the "don't show again" button
        GuideDialogSteps.clickConfirmCancelDialogDontShowAgainButton();

        // Then, the confirm cancel dialog should be closed and the guide should be canceled
        GuideDialogSteps.getConfirmCancelDialog().should('not.exist');

        // When I try to autostart it again
        GuideSteps.autostartGuide(guideName);
        // Then, I should not see the guide anymore. A disabled flag should be set to true in the storage,
        // when the guide is completed via autostart, preventing the guide from autostarting again.
        GuideDialogSteps.getModalDialog().should('not.exist');
    });
});
