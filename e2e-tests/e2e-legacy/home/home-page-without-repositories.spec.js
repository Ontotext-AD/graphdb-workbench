import HomeSteps from '../../steps/home-steps';
import {RepositoryErrorsWidgetSteps} from "../../steps/widgets/repository-errors-widget-steps";
import {LicenseWidgetSteps} from "../../steps/widgets/license-widget-steps";
import {RepositoriesStubs} from "../../stubs/repositories/repositories-stubs";
import {LicenseStubs} from "../../stubs/license-stubs";

describe('Home page: without repositories', () => {

  beforeEach(() => {
    cy.viewport(1280, 1000);
    RepositoriesStubs.spyGetRepositories();
    LicenseStubs.spyGetLicense();
    HomeSteps.visitAndWaitLoader();
    cy.wait('@getRepositories');
  });

  it('should render navigation menu', () => {
    HomeSteps.getNavigationMenu().should('be.visible');
  });

  it('should render page header with tools', () => {
    // RDF search box should not be visible when there is no selected repository
    HomeSteps.getRDFSearchButton().should('not.be.visible');
    // Repository selector menu should be visible and empty
    HomeSteps.getRepositorySelector().should('be.visible');
    HomeSteps.getSelectedRepository().should('contain', 'No accessible repositories');
    // Language selector menu should be visible and default to English
    HomeSteps.getLanguageSelector().should('be.visible');
    HomeSteps.getSelectedLanguage().should('contain', 'en');
  });

  it('should render repository errors widget', () => {
    HomeSteps.getRepositoryErrorsWidget().should('be.visible');
    RepositoryErrorsWidgetSteps.getInfoMessage().should('contain', 'Some functionalities are not available because you are not connected to any repository.');
    RepositoryErrorsWidgetSteps.getCreateRepositoryBtn().should('be.visible');
    RepositoryErrorsWidgetSteps.getShowRemoteLocationsBtn().should('be.visible');
  });

  it('should render license widget', () => {
    HomeSteps.getLicenseWidget().should('be.visible');
    LicenseWidgetSteps.getLicenseWidgetHeader().should('contain', 'License');
  });

  it('should not render active repository widget', () => {
    HomeSteps.getActiveRepositoryWidget().should('be.hidden');
  });

  it('should not render saved SPARQL queries widget', () => {
    HomeSteps.getSavedSparqlQueriesWidget().should('be.hidden');
  });

  it('should render license widget', () => {
    cy.wait('@get-license');
    HomeSteps.getLicenseWidget().should('be.visible');
    LicenseWidgetSteps.getLicenseWidgetHeader().should('contain', 'License');
  });

  it('should render page footer', () => {
    HomeSteps.getPageFooter().should('be.visible');
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
