import {GuidesStubs} from "../../../stubs/guides/guides-stubs.js";
import {GuideSteps} from "../../../steps/guides/guide-steps.js";
import {GuideDialogSteps} from "../../../steps/guides/guide-dialog-steps.js";

describe('Welcome', () => {
    let repositoryId;

    beforeEach(() => {
        repositoryId = 'welcome-guide-step-' + Date.now();
        GuidesStubs.stubWelcomGuide();
        cy.createRepository({id: repositoryId});
        cy.presetRepository(repositoryId);

        GuideSteps.visit();
        GuideSteps.verifyGuidesListExists();
        cy.wait('@getGuides');
        GuideSteps.runFirstGuide()
    });

    afterEach(() => {
        cy.deleteRepository(repositoryId);
    });

    it.only('Should shows welcome steps', () => {
        GuideDialogSteps.assertDialogWithTitleIsVisible('Welcome to Welcome — 1/2');
        GuideDialogSteps.assertDialogWithContentIsVisible('Throughout the guide you will see boxes like this one that will provide instructions on what to do.');
        GuideDialogSteps.clickOnNextButton();

        GuideDialogSteps.assertDialogWithTitleIsVisible('Welcome to Welcome — 2/2');
        GuideDialogSteps.assertDialogWithContentIsVisible('Test welcome guideLet\'s get started for real now!');
        GuideDialogSteps.clickOnNextButton();

        GuideDialogSteps.assertDialogWithTitleIsVisible('End of guide');
        GuideDialogSteps.assertDialogWithContentIsVisible('This guide has ended.');
    });
});
