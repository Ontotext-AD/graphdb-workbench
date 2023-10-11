import {GuideDialogSteps} from "../../steps/guides/guide-dialog-steps";
import {GuideSteps} from "../../steps/guides/guide-steps";
import {MoviesGuideSteps} from "../../steps/guides/movies-guide-steps";

const MOVIES_FILE_FOR_IMPORT = 'movies.ttl';
describe('Interactive guides', () => {

    let repositoryId;

    beforeEach(() => {
        cy.intercept('/rest/guides', {fixture: '/guides/guides.json'}).as('getGuides');
        repositoryId = 'movies';
        cy.viewport(1880, 1000);
        GuideSteps.visit();
        cy.wait(['@getGuides']);
    });

    afterEach(() => {
        cy.deleteRepository(repositoryId);
    });

    context('Describes "Movies" interactive guide', () => {
        it('Tests movies interactive guide using "Next" button to the end', () => {

            const stepAssertions = [
                {assert: MoviesGuideSteps.assertExploreClassHierarchyStep1},
                {assert: MoviesGuideSteps.assertExploreClassHierarchyStep2},
                {assert: MoviesGuideSteps.assertExploreClassHierarchyStep3},
                {assert: MoviesGuideSteps.assertExploreClassHierarchyStep4},
                {assert: MoviesGuideSteps.assertExploreClassHierarchyStep5},
                {assert: MoviesGuideSteps.assertExploreClassHierarchyStep6},
                {assert: MoviesGuideSteps.assertExploreClassHierarchyStep7},
                {assert: MoviesGuideSteps.assertClassHierarchyInstancesStep1},
                {assert: MoviesGuideSteps.assertClassHierarchyInstancesStep2},
                {assert: MoviesGuideSteps.assertClassHierarchyInstancesStep3},
                {assert: MoviesGuideSteps.assertClassHierarchyInstancesStep4},
                {assert: MoviesGuideSteps.assertClassHierarchyInstancesStep5},
                // Forces the click because results are to many and dialog is not visible into the test.
                {assert: MoviesGuideSteps.assertClassHierarchyInstancesStep6, forceButtonClick: true},
                {assert: MoviesGuideSteps.assertClassHierarchyInstancesStep7, forceButtonClick: true},
                {assert: MoviesGuideSteps.assertClassHierarchyInstancesStep8},
                {assert: MoviesGuideSteps.assertExecuteSparqlQueryStep1},
                {assert: MoviesGuideSteps.assertExecuteSparqlQueryStep2},
                {assert: MoviesGuideSteps.assertExecuteSparqlQueryStep3},
                {assert: MoviesGuideSteps.assertExecuteSparqlQueryStep4},
                {assert: MoviesGuideSteps.assertExecuteSparqlQueryStep5},
                {assert: MoviesGuideSteps.assertExecuteSparqlQueryStep6},
                {assert: MoviesGuideSteps.assertExecuteSparqlQueryStep7},
                {assert: MoviesGuideSteps.assertExecuteSparqlQueryStep8, forceButtonClick: true},
                {assert: MoviesGuideSteps.assertExploreRDFStep1, forceButtonClick: true},
                {assert: MoviesGuideSteps.assertExploreRDFStep2},
                {assert: MoviesGuideSteps.assertExploreRDFStep3},
                {assert: MoviesGuideSteps.assertExploreRDFStep4},
                {assert: MoviesGuideSteps.assertExploreRDFStep5},
                {assert: MoviesGuideSteps.assertExploreRDFStep6},
                {assert: MoviesGuideSteps.assertExploreRDFStep7},
                {assert: MoviesGuideSteps.assertExploreRDFStep8},
                {assert: MoviesGuideSteps.assertExploreRDFStep9},
                {assert: MoviesGuideSteps.assertExploreRDFStep10},
                {assert: MoviesGuideSteps.assertSparqlQueryStep1},
                {assert: MoviesGuideSteps.assertSparqlQueryStep2},
                {assert: MoviesGuideSteps.assertSparqlQueryStep3},
                {assert: MoviesGuideSteps.assertSparqlQueryStep4},
                {assert: MoviesGuideSteps.assertSparqlQueryStep5},
                {assert: MoviesGuideSteps.assertSparqlQueryStep6},
                {assert: MoviesGuideSteps.assertSparqlQueryStep7}
            ];

            const guideName = '3 The Movies database guide';
            GuideSteps.runGuideTest(guideName, repositoryId, MOVIES_FILE_FOR_IMPORT, stepAssertions);
        });
    });
});
