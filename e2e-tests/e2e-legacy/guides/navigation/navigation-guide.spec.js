import {GuidesStubs} from "../../../stubs/guides/guides-stubs.js";
import {GuideSteps} from "../../../steps/guides/guide-steps.js";
import {GuideDialogSteps} from "../../../steps/guides/guide-dialog-steps.js";
import {NotFoundSteps} from "../../../steps/not-found/not-found-steps.js";
import {BaseSteps} from "../../../steps/base-steps.js";
import {RepositoriesStubs} from "../../../stubs/repositories/repositories-stubs.js";

describe('navigation guide', () => {
    let repositoryId;

    beforeEach(() => {
        repositoryId = 'navigation-guide-' + Date.now();
        RepositoriesStubs.stubBaseEndpoints(repositoryId);
        cy.createRepository({id: repositoryId});
        cy.presetRepository(repositoryId);
        GuidesStubs.stubNavigationGuide();
        GuideSteps.visit();
        GuideSteps.verifyGuidesListExists();
        cy.wait('@getGuides');
        GuideSteps.runFirstGuide();
    });

    afterEach(() => {
        cy.deleteRepository(repositoryId);
    });

    it('should navigate between microfrontends', () => {
        // Given I am on the 404 page, which is an angular view
        BaseSteps.getUrl().should('include', '404');
        GuideDialogSteps.assertDialogWithTitleIsVisible('Navigation');
        GuideDialogSteps.assertDialogWithContentIsVisible('This is a 404 page');
        GuideDialogSteps.clickOnNextButton();

        GuideDialogSteps.assertDialogWithTitleIsVisible('Navigation');
        GuideDialogSteps.assertDialogWithContentIsVisible('This is the go back home button');

        // When I navigate to the home page
        NotFoundSteps.clickGoHomeButton();

        // Then I should see the home page, which is an angularjs view
        BaseSteps.getUrl().should('include', '/');
        GuideDialogSteps.assertDialogWithTitleIsVisible('Navigation');
        GuideDialogSteps.assertDialogWithContentIsVisible('This is the home page');
        // When, I navigate to an angular view again (/sparql-new)
        GuideDialogSteps.clickOnNextButton();

        // Then I should see the new sparql view, which is an angular view
        BaseSteps.getUrl().should('include', 'sparql-new');
        GuideDialogSteps.assertDialogWithTitleIsVisible('Navigation');
        GuideDialogSteps.assertDialogWithContentIsVisible('This is the new sparql view');

        // When, I navigate to an angularjs view again (import)
        GuideDialogSteps.clickOnNextButton();

        // Then I should see the import page, which is an angularjs view
        BaseSteps.getUrl().should('include', 'import');
        GuideDialogSteps.assertDialogWithTitleIsVisible('Navigation');
        GuideDialogSteps.assertDialogWithContentIsVisible('This is the import view');
        GuideDialogSteps.clickOnNextButton();

        GuideDialogSteps.assertDialogWithTitleIsVisible('End of guide');
        GuideDialogSteps.assertDialogWithContentIsVisible('This guide has ended');
    });
});
