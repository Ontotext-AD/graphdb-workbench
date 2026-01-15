import {GuideSteps} from '../../../steps/guides/guide-steps.js';
import {GuideDialogSteps} from '../../../steps/guides/guide-dialog-steps.js';
import {MainMenuSteps} from '../../../steps/main-menu-steps.js';
import {AutocompleteSteps} from '../../../steps/setup/autocomplete-steps.js';
import {GuidesStubs} from '../../../stubs/guides/guides-stubs.js';

describe('Enable autocomplete guide', () => {
    let repositoryId;

    beforeEach(() => {
        repositoryId = 'guides-' + Date.now();
        GuidesStubs.stubEnableAutocompleteGuide();
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

    it('Should enable autocomplete', () => {
        GuideDialogSteps.assertDialogWithTitleIsVisible('Enable autocomplete — 1/5');
        GuideDialogSteps.assertDialogWithContentIsVisible('The following steps show how to use the Autocomplete index view to enable the autocomplete index.');
        GuideDialogSteps.clickOnNextButton();

        GuideDialogSteps.assertDialogWithTitleIsVisible('Enable autocomplete — 2/5');
        GuideDialogSteps.assertDialogWithContentIsVisible('Click on the Setup menu.');
        MainMenuSteps.clickOnMenuSetup();

        GuideDialogSteps.assertDialogWithTitleIsVisible('Enable autocomplete — 3/5');
        GuideDialogSteps.assertDialogWithContentIsVisible('Click on the Autocomplete menu.');
        MainMenuSteps.clickOnSubmenuAutocomplete();

        GuideDialogSteps.assertDialogWithTitleIsVisible('Enable autocomplete — 4/5');
        GuideDialogSteps.assertDialogWithContentIsVisible('Click on the checkbox to enable the index.');
        AutocompleteSteps.enableToggleAutocomplete();

        GuideDialogSteps.assertDialogWithTitleIsVisible('Enable autocomplete — 5/5');
        GuideDialogSteps.assertDialogWithContentIsVisible('Wait until indexing finished.');

        GuideDialogSteps.clickOnCloseButton();
        GuideDialogSteps.assertDialogIsClosed();
    });
});
