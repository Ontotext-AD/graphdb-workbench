import {GuideSteps} from '../../../steps/guides/guide-steps.js';
import {GuideDialogSteps} from '../../../steps/guides/guide-dialog-steps.js';
import {MainMenuSteps} from '../../../steps/main-menu-steps.js';
import {GuidesStubs} from '../../../stubs/guides/guides-stubs.js';
import {SimilarityIndexCreateSteps} from '../../../steps/explore/similarity-index-create-steps.js';
import {SimilarityIndexesSteps} from '../../../steps/explore/similarity-indexes-steps.js';

describe('Create similarity index guide steps', () => {
    const FILE_TO_IMPORT = 'wine.rdf'
    let repositoryId;

    beforeEach(() => {
        repositoryId = 'create-similarity-index-guide-' + Date.now();
        GuidesStubs.stubCreateSimilarityIndexGuide();
        cy.createRepository({id: repositoryId});
        cy.importServerFile(repositoryId, FILE_TO_IMPORT);
        cy.presetRepository(repositoryId);

        GuideSteps.visit();
        GuideSteps.verifyGuidesListExists();
        cy.wait('@getGuides');
        GuideSteps.runFirstGuide()
    });

    afterEach(() => {
        cy.deleteRepository(repositoryId);
    });

    it('Should create similarity index', () => {
        GuideDialogSteps.assertDialogWithTitleIsVisible('Create Similarity index — 1/8');
        GuideDialogSteps.assertDialogWithContentIsVisible('The following steps show how to create a Similarity index for your dataset.');
        GuideDialogSteps.clickOnNextButton();

        GuideDialogSteps.assertDialogWithTitleIsVisible('Create Similarity index — 2/8');
        GuideDialogSteps.assertDialogWithContentIsVisible('Click on the Explore menu.');
        MainMenuSteps.clickOnExplore();

        GuideDialogSteps.assertDialogWithTitleIsVisible('Create Similarity index — 3/8');
        GuideDialogSteps.assertDialogWithContentIsVisible('Click on the Similarity menu.');
        MainMenuSteps.clickOnSubmenuSimilarity();

        GuideDialogSteps.assertDialogWithTitleIsVisible('Create Similarity index — 4/8');
        GuideDialogSteps.assertDialogWithContentIsVisible('Click the link to start creating a new Similarity index');
        SimilarityIndexesSteps.clickCreateButton();

        GuideDialogSteps.assertDialogWithTitleIsVisible('Create Similarity index — 5/8');
        GuideDialogSteps.assertDialogWithContentIsVisible('Type a name for the index. You will refer to it later.');
        SimilarityIndexCreateSteps.typeSimilarityIndexName('new-similarity-index');
        GuideDialogSteps.clickOnNextButton();

        GuideDialogSteps.assertDialogWithTitleIsVisible('Create Similarity index — 6/8');
        GuideDialogSteps.assertDialogWithContentIsVisible('Click the button to create the Similarity index.')
        SimilarityIndexCreateSteps.create();

        GuideDialogSteps.assertDialogWithTitleIsVisible('Create Similarity index — 8/8');
        GuideDialogSteps.assertDialogWithContentIsVisible('Wait for index to be created')
        GuideDialogSteps.clickOnNextButton();

        GuideDialogSteps.assertDialogWithTitleIsVisible('Select by index name');
        GuideDialogSteps.assertDialogWithContentIsVisible('In the Existing Indexes table, you can now see the new-similarity-index which is the similarity index we created with the previous query.')
        GuideDialogSteps.clickOnNextButton();

        GuideDialogSteps.assertDialogWithTitleIsVisible('Select by row index 0 (first row)');
        GuideDialogSteps.assertDialogWithContentIsVisible('In the Existing Indexes table, you can now see the created index.')
        GuideDialogSteps.clickOnNextButton();

        GuideDialogSteps.assertDialogWithTitleIsVisible('Select default index 0 (first row)');
        GuideDialogSteps.assertDialogWithContentIsVisible('In the Existing Indexes table, you can now see the created index.')
        GuideDialogSteps.clickOnNextButton();

        GuideDialogSteps.clickOnCloseButton();
        GuideDialogSteps.assertDialogIsClosed();
    });
});
