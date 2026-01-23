import {GuideSteps} from '../../../steps/guides/guide-steps.js';
import {GuideDialogSteps} from '../../../steps/guides/guide-dialog-steps.js';
import {GuidesStubs} from '../../../stubs/guides/guides-stubs.js';

describe('Download guide resource guide steps', () => {
    let repositoryId;
    const resourcePath = 'file-path';
    const resourceFile = 'file.ttl';
    const guideRepositoryId = 'test-repo';

    beforeEach(() => {
        repositoryId = 'download-guide-resource-guide-' + Date.now();
        GuidesStubs.stubDownloadGuideResourceGuide();
        cy.createRepository({id: repositoryId});
        cy.presetRepository(repositoryId);

        GuidesStubs.stubDownloadResource(resourcePath, resourceFile);

        GuideSteps.visit();
        GuideSteps.verifyGuidesListExists();
        cy.wait('@getGuides');
        GuideSteps.runFirstGuide();
    });

    afterEach(() => {
        cy.deleteRepository(repositoryId);
    });

    it('Should guide through download guide resource', () => {
        GuideDialogSteps.assertDialogWithTitleIsVisible('Download guide resources');
        GuideDialogSteps.assertDialogWithContentIsVisible('This guide requires a file to be downloaded.');
        GuideDialogSteps.assertDialogWithContentIsVisible(`Please download ${resourceFile}.`);
        GuideSteps.downloadResource();

        cy.wait('@resource-download').then((interception) => {
            expect(interception.response.statusCode).to.eq(200);
            cy.readFile(`cypress/downloads/${resourceFile}`);
        });

        GuideDialogSteps.clickOnNextButton();

        GuideDialogSteps.assertDialogWithTitleIsVisible('Download guide resource - with repositoryId');
        GuideDialogSteps.assertDialogWithContentIsVisible('This guide requires a file to be downloaded.');
        GuideDialogSteps.assertDialogWithContentIsVisible(`Please download ${resourceFile}.`);
        GuideSteps.downloadResource(guideRepositoryId);

        cy.wait('@resource-download').then((interception) => {
            expect(interception.response.statusCode).to.eq(200);
            cy.readFile(`cypress/downloads/${resourceFile}`);
        });

        GuideDialogSteps.clickOnCloseButton();
        GuideDialogSteps.assertDialogIsClosed();
    });
});
