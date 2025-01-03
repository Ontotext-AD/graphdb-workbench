import {GuideSteps} from "../../steps/guides/guide-steps";
import {StarWarsGuideSteps} from "../../steps/guides/star-wars-guide-steps";

const STAR_WARS_FILE_FOR_IMPORT = 'starwars.ttl';


/**
 * TODO: Fix me. Broken due to migration (Changes in main menu)
 */
describe.skip('Describes "Starwars" interactive guide', () => {

    let repositoryId;

    beforeEach(() => {
        cy.intercept('/rest/guides', {fixture: '/guides/guides.json'}).as('getGuides');
        repositoryId = 'starwars';
        cy.viewport(1880, 1000);
        GuideSteps.visit();
        cy.wait(['@getGuides']);
    });

    afterEach(() => {
        cy.deleteUploadedFile(repositoryId, STAR_WARS_FILE_FOR_IMPORT);
        cy.deleteRepository(repositoryId);
    });

    it('should go through "Star wars" interactive guide', () => {

        const guideName = '1 The Star Wars guide';
        const allStepValidationFunctions = [
            {assert: StarWarsGuideSteps.assertVisualGraphExploreStep1},
            {assert: StarWarsGuideSteps.assertVisualGraphExploreStep2},
            {assert: StarWarsGuideSteps.assertVisualGraphExploreStep3},
            {assert: StarWarsGuideSteps.assertVisualGraphExploreSte4},
            {assert: StarWarsGuideSteps.assertVisualGraphExploreSte5},
            {assert: StarWarsGuideSteps.assertVisualGraphExploreSte6},
            {assert: StarWarsGuideSteps.assertSte30},
            {assert: StarWarsGuideSteps.assertSte31},
            {assert: StarWarsGuideSteps.assertSte32},
            {assert: StarWarsGuideSteps.assertSte33},
            {assert: StarWarsGuideSteps.assertSte34},
            {assert: StarWarsGuideSteps.assertVisualGraphPropertiesStep1},
            {assert: StarWarsGuideSteps.assertVisualGraphPropertiesStep2},
            {assert: StarWarsGuideSteps.assertVisualGraphPropertiesStep3},
            {assert: StarWarsGuideSteps.assertVisualGraphPropertiesStep4},
            {assert: StarWarsGuideSteps.assertVisualGraphPropertiesStep5},
            {assert: StarWarsGuideSteps.assertVisualGraphPropertiesStep6},
            {assert: StarWarsGuideSteps.assertStep41},
            {assert: StarWarsGuideSteps.assertStep42},
            {assert: StarWarsGuideSteps.assertStep43},
            {assert: StarWarsGuideSteps.assertExecuteSparqlQueryStep1},
            {assert: StarWarsGuideSteps.assertExecuteSparqlQueryStep2},
            {assert: StarWarsGuideSteps.assertExecuteSparqlQueryStep3},
            {assert: StarWarsGuideSteps.assertExecuteSparqlQueryStep4},
            {assert: StarWarsGuideSteps.assertExecuteSparqlQueryStep5},
            {assert: StarWarsGuideSteps.assertExecuteSparqlQueryStep6},
            {assert: StarWarsGuideSteps.assertExecuteSparqlQueryStep7},
            {assert: StarWarsGuideSteps.assertExecuteSparqlQueryStep8},
            {assert: StarWarsGuideSteps.assertExecuteSparqlQueryStep9},
            {assert: StarWarsGuideSteps.assertExecuteSparqlQueryStep10},
            {assert: StarWarsGuideSteps.assertExecuteSparqlQueryStep11}
        ];

        GuideSteps.runGuideTest(guideName, repositoryId, STAR_WARS_FILE_FOR_IMPORT, allStepValidationFunctions);
    });
});
