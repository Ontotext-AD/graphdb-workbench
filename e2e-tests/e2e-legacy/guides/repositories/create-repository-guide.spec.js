import {GuideSteps} from '../../../steps/guides/guide-steps.js';
import createRepoGuideArray from '../../../fixtures/guides/create-repository/create-repository-guide.json';
import {GuideDialogSteps} from "../../../steps/guides/guide-dialog-steps.js";
import {MainMenuSteps} from "../../../steps/main-menu-steps.js";
import {RepositorySteps} from "../../../steps/repository-steps.js";
import {GuidesStubs} from '../../../stubs/guides/guides-stubs.js';

describe('Create repository guide', () => {
    const createRepoGuide = createRepoGuideArray[0];
    const repositoryId = createRepoGuide.options.repositoryIdBase = 'create-repo-guide-' + Date.now();

    beforeEach(() => {
        GuidesStubs.stubCreateRepositoryGuide(createRepoGuideArray);
        GuideSteps.visit();
        GuideSteps.verifyGuidesListExists();
        cy.wait('@getGuides');
        GuideSteps.runGuide(createRepoGuide.guideName.en)
    });

    afterEach(() => {
        cy.deleteRepository(repositoryId);
    });

    it('Should create and select a repository', () => {
        GuideDialogSteps.assertDialogWithTitleIsVisible('Create repository — 1/7');
        GuideDialogSteps.assertDialogWithContentIsVisible('The following steps show how to use the Repositories view to create a repository.');
        GuideDialogSteps.clickOnNextButton();

        GuideDialogSteps.assertDialogWithTitleIsVisible('Create repository — 2/7');
        GuideDialogSteps.assertDialogWithContentIsVisible('Click on the Setup menu.');
        MainMenuSteps.clickOnMenuSetup();

        GuideDialogSteps.assertDialogWithTitleIsVisible('Create repository — 3/7');
        GuideDialogSteps.assertDialogWithContentIsVisible('Click on the Repositories menu.');
        MainMenuSteps.clickOnRepositoriesSubmenu();

        GuideDialogSteps.assertDialogWithTitleIsVisible('Create repository — 4/7');
        GuideDialogSteps.assertDialogWithContentIsVisible('Click on the Create new repository button.');
        RepositorySteps.createRepository();

        GuideDialogSteps.assertDialogWithTitleIsVisible('Create repository — 5/7');
        GuideDialogSteps.assertDialogWithContentIsVisible('Click on the GraphDB Repository button.');
        RepositorySteps.clickGDBRepositoryTypeButton();

        GuideDialogSteps.assertDialogWithTitleIsVisible('Create repository — 6/7');
        GuideDialogSteps.assertDialogWithContentIsVisible(`Enter repository ID: ${repositoryId}`);
        RepositorySteps.typeRepoId(repositoryId);
        GuideDialogSteps.clickOnNextButton();

        GuideDialogSteps.assertDialogWithTitleIsVisible('Create repository — 7/7');
        GuideDialogSteps.assertDialogWithContentIsVisible('Click on the Create button.');
        RepositorySteps.saveRepository();

        GuideDialogSteps.assertDialogWithTitleIsVisible('Connect to repository — 1/2')
        GuideDialogSteps.assertDialogWithContentIsVisible('Click on the repository selection dropdown.');
        RepositorySteps.clickRepositoriesDropdown();

        GuideDialogSteps.assertDialogWithTitleIsVisible('Connect to repository — 2/2');
        GuideDialogSteps.assertDialogWithContentIsVisible(`Click on the ${repositoryId}`);
        RepositorySteps.selectRepositoryFromDropdown(repositoryId);

        GuideDialogSteps.assertDialogWithTitleIsVisible('Repositories');
        GuideDialogSteps.assertDialogWithContentIsVisible('Click the connect repository icon');
        RepositorySteps.clickConnectRepositoryButton(repositoryId);

        GuideDialogSteps.assertDialogWithTitleIsVisible('End of guide');
        GuideDialogSteps.assertDialogWithContentIsVisible('This guide has ended.');
    })
})
