import {GuidesStubs} from "../../../stubs/guides/guides-stubs.js";
import {GuideSteps} from "../../../steps/guides/guide-steps.js";
import {GuideDialogSteps} from "../../../steps/guides/guide-dialog-steps.js";
import ImportSteps from "../../../steps/import/import-steps.js";
import {ToasterSteps} from "../../../steps/toaster-steps.js";
import {MainMenuSteps} from "../../../steps/main-menu-steps.js";
import {ImportSettingsDialogSteps} from "../../../steps/import/import-settings-dialog-steps.js";

describe('Import RDF file', () => {
    const GUIDE_RESOURCE_FILE = 'starwars.ttl';
    const WRONG_GUIDE_RESOURCE_FILE = 'movies.ttl';
    let repositoryId;

    beforeEach(() => {
        repositoryId = 'import-rdf-file-guide-step-' + Date.now();
        GuidesStubs.stubImportRDFFileGuide();
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

    it('Should import an RDF file (User interaction)', () => {
        // GIVEN: I start a guide that includes the Import RDF File step.
        GuideDialogSteps.assertDialogWithTitleIsVisible('Import file — 1/6');
        GuideDialogSteps.assertDialogWithContentIsVisible('The following steps show how to use the Import view to import data from a file.');
        GuideDialogSteps.clickOnNextButton();

        GuideDialogSteps.assertDialogWithTitleIsVisible('Import file — 2/6');
        GuideDialogSteps.assertDialogWithContentIsVisible('Click on the Import menu.');
        MainMenuSteps.clickOnMenuImport();

        GuideDialogSteps.assertDialogWithTitleIsVisible('Import file — 3/6');
        GuideDialogSteps.assertDialogWithContentIsVisible('Click on the Upload RDF files button and choose a file with the name starwars.ttl.');

        // WHEN: I try to upload a wrong RDF file.
        ImportSteps.selectFile(`fixtures/guides/${WRONG_GUIDE_RESOURCE_FILE}`);

        // THEN: An error message should be displayed.
        ToasterSteps.verifyError(`The uploaded file does not match the expected resource. Please upload ${GUIDE_RESOURCE_FILE}.`)
        // AND: The guide should still be on the same step.
        GuideDialogSteps.assertDialogWithTitleIsVisible('Import file');
        GuideDialogSteps.assertDialogWithContentIsVisible(`Click on the Upload RDF files button and choose a file with the name ${GUIDE_RESOURCE_FILE}.`);

        // WHEN: I upload the correct RDF file.
        ImportSteps.selectFile(`fixtures/guides/${GUIDE_RESOURCE_FILE}`);

        // THEN: I expect the guide to continue.
        GuideDialogSteps.assertDialogWithTitleIsVisible('Import file — 5/6');
        GuideDialogSteps.assertDialogWithContentIsVisible('Click on the Import button.');
        ImportSettingsDialogSteps.import();

        GuideDialogSteps.assertDialogWithTitleIsVisible('Import file — 6/6');
        GuideDialogSteps.assertDialogWithContentIsVisible('Wait until import finished.');
        GuideDialogSteps.clickOnNextButton();

        GuideDialogSteps.assertDialogWithTitleIsVisible('End of guide');
        GuideDialogSteps.assertDialogWithContentIsVisible('This guide has ended.');
    });

    it('Should import an RDF file (Next flow)', () => {
        // GIVEN: I start a guide that includes the Import RDF File step.
        GuideDialogSteps.assertDialogWithTitleIsVisible('Import file — 1/6');
        GuideDialogSteps.assertDialogWithContentIsVisible('The following steps show how to use the Import view to import data from a file.');
        GuideDialogSteps.clickOnNextButton();

        GuideDialogSteps.assertDialogWithTitleIsVisible('Import file — 2/6');
        GuideDialogSteps.assertDialogWithContentIsVisible('Click on the Import menu.');
        GuideDialogSteps.clickOnNextButton();

        GuideDialogSteps.assertDialogWithTitleIsVisible('Import file — 3/6');
        GuideDialogSteps.assertDialogWithContentIsVisible('Click on the Upload RDF files button and choose a file with the name starwars.ttl.');

        // WHEN: I try to continue with the guide without selecting an RDF file.
        GuideDialogSteps.clickOnNextButton();

        // THEN: An error message should be displayed.
        ToasterSteps.verifyError(`Upload the file ${GUIDE_RESOURCE_FILE} first`);
        // AND: The guide should still be on the same step.
        GuideDialogSteps.assertDialogWithTitleIsVisible('Import file');
        GuideDialogSteps.assertDialogWithContentIsVisible(`Click on the Upload RDF files button and choose a file with the name ${GUIDE_RESOURCE_FILE}.`);

        // WHEN: I upload the correct RDF file.
        ImportSteps.selectFile(`fixtures/guides/${GUIDE_RESOURCE_FILE}`);

        // THEN: I expect the guide to continue.
        GuideDialogSteps.assertDialogWithTitleIsVisible('Import file — 5/6');
        GuideDialogSteps.assertDialogWithContentIsVisible('Click on the Import button.');
        GuideDialogSteps.clickOnNextButton();

        GuideDialogSteps.assertDialogWithTitleIsVisible('Import file — 6/6');
        GuideDialogSteps.assertDialogWithContentIsVisible('Wait until import finished.');
        GuideDialogSteps.clickOnNextButton();

        GuideDialogSteps.assertDialogWithTitleIsVisible('End of guide');
        GuideDialogSteps.assertDialogWithContentIsVisible('This guide has ended.');
    });
});
