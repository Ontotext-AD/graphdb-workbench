import HomeSteps from '../../steps/home-steps';

describe('Home screen validation', () => {

    beforeEach(() => {
        cy.viewport(1280, 1000);
        HomeSteps.visitAndWaitLoader();
    });

    context('First visit', () => {
        it('Verify that tutorial panel exists', () => {
            HomeSteps.verifyTutorialVisible(true);
        });

        it('Test tutorial text', () => {
            HomeSteps.verifyTutorialText(0, 'Welcome to GraphDB');
            HomeSteps.verifyTutorialText(1, 'Create a repository');
            HomeSteps.verifyTutorialText(2, 'Load a sample dataset');
            HomeSteps.verifyTutorialText(3, 'Run a SPARQL query');
            HomeSteps.verifyTutorialText(4, 'REST API');
        });

        it('Verify that tutorial panel disappears if "No, thanks button" is clicked', () => {
            // Verify that tutorial panel is still visible
            HomeSteps.verifyTutorialVisible(true);
            HomeSteps.declineTutorial();
            HomeSteps.verifyTutorialVisible(false);
        });
    });
});
