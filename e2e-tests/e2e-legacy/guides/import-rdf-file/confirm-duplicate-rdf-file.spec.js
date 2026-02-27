import {GuidesStubs} from "../../../stubs/guides/guides-stubs.js";
import {GuideSteps} from "../../../steps/guides/guide-steps.js";
import {GuideDialogSteps} from "../../../steps/guides/guide-dialog-steps.js";
import ImportSteps from "../../../steps/import/import-steps.js";
import {ImportUserDataSteps} from "../../../steps/import/import-user-data-steps.js";
import {ImportSettingsDialogSteps} from "../../../steps/import/import-settings-dialog-steps.js";
import {MainMenuSteps} from "../../../steps/main-menu-steps.js";
import {FileOverwriteDialogSteps} from "../../../steps/import/file-overwrite-dialog-steps.js";

describe('Confirm duplicate RDF file', () => {
    const GUIDE_RESOURCE_FILE = 'starwars.ttl';
    let repositoryId;

    beforeEach(() => {
        repositoryId = 'confirm-duplicate-rdf-file-guide-step-' + Date.now();
        GuidesStubs.stubConfirmDuplicatedRDFFileGuide();
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

    it('Should display an additional step that prompts the user to override the already imported file', () => {
        // GIVEN: I have already uploaded an RDF file with the same name as the guide's rdf file.
        ImportSteps.selectFile(`fixtures/guides/${GUIDE_RESOURCE_FILE}`);
        GuideDialogSteps.assertDialogWithTitleIsVisible('Import file');
        GuideDialogSteps.assertDialogWithContentIsVisible('Click on the Import button.');
        ImportSettingsDialogSteps.import();
        ImportUserDataSteps.checkImportedResource(0, GUIDE_RESOURCE_FILE);

        // WHEN: I run a guide that includes the Import RDF File step.
        GuideDialogSteps.assertDialogWithTitleIsVisible('Import file — 1/6');
        GuideDialogSteps.assertDialogWithContentIsVisible('The following steps show how to use the Import view to import data from a file.');
        GuideDialogSteps.clickOnNextButton();

        GuideDialogSteps.assertDialogWithTitleIsVisible('Import file — 2/6');
        GuideDialogSteps.assertDialogWithContentIsVisible('Click on the Import menu.');
        MainMenuSteps.clickOnMenuImport();

        GuideDialogSteps.assertDialogWithTitleIsVisible('Import file — 3/6');
        GuideDialogSteps.assertDialogWithContentIsVisible('Click on the Upload RDF files button and choose a file with the name starwars.ttl.');
        ImportSteps.selectFile(`fixtures/guides/${GUIDE_RESOURCE_FILE}`);

        // THEN: I should see an additional step that prompts me to override the already imported file.
        GuideDialogSteps.assertDialogWithTitleIsVisible('Import file — 4/6');
        GuideDialogSteps.assertDialogWithContentIsVisible('Click on the Yes button to override the existing file.');

        // WHEN: The user confirms the override.
        FileOverwriteDialogSteps.overwrite();

        // THEN: The guide should continue with the import step.
        GuideDialogSteps.assertDialogWithTitleIsVisible('Import file — 5/6');
        GuideDialogSteps.assertDialogWithContentIsVisible('Click on the Import button.');
        GuideDialogSteps.clickOnNextButton();
    });
});
