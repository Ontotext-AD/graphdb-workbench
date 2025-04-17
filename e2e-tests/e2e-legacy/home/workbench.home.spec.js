import HomeSteps from '../../steps/home-steps';

describe('Home page', () => {

  beforeEach(() => {
    cy.viewport(1280, 1000);
    HomeSteps.visitAndWaitLoader();
  });

  context('when no repository is selected', () => {

    it('should render navigation menu', () => {
      HomeSteps.getNavigationMenu().should('be.visible');
    });

    it('should render page header with tools', () => {
      // RDF search box should not be visible when there is no selected repository
      HomeSteps.getRDFSearchButton().should('not.be.visible');
      // Repository selector menu should be visible and empty
      HomeSteps.getRepositorySelector().should('be.visible');
      HomeSteps.getSelectedRepository().should('contain', 'Choose repository');
      // Language selector menu should be visible and default to English
      HomeSteps.getLanguageSelector().should('be.visible');
      HomeSteps.getSelectedLanguage().should('contain', 'en');
    });

    it('should not render active repository widget', () => {
      HomeSteps.getActiveRepositoryWidget().should('not.exist');
    });

    it('should render repository select widget', () => {

    });

    it('should render license widget', () => {

    });
  });

  context('when a repository is selected', () => {

  });

  it('should render active repository widget', () => {
    // HomeSteps
  });

  it('should render saved SPARQL queries widget', () => {

  });

  it('should render license widget', () => {

  });

  it('should render page footer', () => {

  });

  it('should render the tutorial panel', () => {
    // When I open the home page
    // Then the tutorial panel should be visible by default
    HomeSteps.getTutorialPanel().should('be.visible');
    // And the tutorial panel should contain the following text:
    HomeSteps.verifyTutorialText(0, 'Welcome to GraphDB');
    HomeSteps.verifyTutorialText(1, 'Create a repository');
    HomeSteps.verifyTutorialText(2, 'Load a sample dataset');
    HomeSteps.verifyTutorialText(3, 'Run a SPARQL query');
    HomeSteps.verifyTutorialText(4, 'REST API');
  });

  it('should be able to toggle the tutorial panel', () => {
    // Given I open the home page
    // And I see the tutorial panel
    HomeSteps.getTutorialPanel().should('be.visible');
    // When I decline the tutorial
    HomeSteps.hideTutorial();
    // Then the tutorial panel should be closed
    HomeSteps.getTutorialPanel().should('be.not.exist');
    // When I open the tutorial panel
    HomeSteps.showTutorialPanel();
    // Then the tutorial panel should be visible
    HomeSteps.getTutorialPanel().should('be.visible');
  });
});
