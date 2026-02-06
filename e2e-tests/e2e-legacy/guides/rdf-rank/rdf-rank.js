import {GuidesStubs} from "../../../stubs/guides/guides-stubs.js";
import {GuideSteps} from "../../../steps/guides/guide-steps.js";
import {GuideDialogSteps} from "../../../steps/guides/guide-dialog-steps.js";
import {RdfRankSteps} from "../../../steps/setup/rdf-rank-steps.js";

describe('RDF rank', () => {
    let repositoryId;

    beforeEach(() => {
        repositoryId = 'rdf-rank-guide-step-' + Date.now();
        GuidesStubs.stubRDFRankGuide();
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

    it('Should compute RDF Rank (User interaction)', () => {
        GuideDialogSteps.assertDialogWithTitleIsVisible('RDF Rank');
        GuideDialogSteps.assertDialogWithContentIsVisible('Click on Compute Full to start the RDF Rank computation.');
        RdfRankSteps.computeRdfRank();

        GuideDialogSteps.assertDialogWithTitleIsVisible('End of guide');
        GuideDialogSteps.assertDialogWithContentIsVisible('This guide has ended.');
    });

    it('Should compute RDF Rank (Next flow)', () => {
        GuideDialogSteps.assertDialogWithTitleIsVisible('RDF Rank');
        GuideDialogSteps.assertDialogWithContentIsVisible('Click on Compute Full to start the RDF Rank computation.');
        GuideDialogSteps.clickOnNextButton();

        GuideDialogSteps.assertDialogWithTitleIsVisible('End of guide');
        GuideDialogSteps.assertDialogWithContentIsVisible('This guide has ended.');
    });
});
