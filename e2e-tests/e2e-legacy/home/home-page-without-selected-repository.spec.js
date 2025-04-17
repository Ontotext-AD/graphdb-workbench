import HomeSteps from '../../steps/home-steps';
import {RepositoryErrorsWidgetSteps} from "../../steps/widgets/repository-errors-widget-steps";
import {RepositoriesStubs} from "../../stubs/repositories/repositories-stubs";
import {LicenseStubs} from "../../stubs/license-stubs";
import {SavedQueriesStubs} from "../../stubs/saved-queries-stubs";

describe('Home page: without selected repository', () => {

  let repositoryId;

  beforeEach(() => {
    repositoryId = 'home-page-' + Date.now();
    cy.createRepository({id: repositoryId});
    cy.viewport(1280, 1000);
    RepositoriesStubs.spyGetRepositories();
    RepositoriesStubs.spyGetActiveLocations();
    LicenseStubs.spyGetLicense();
    SavedQueriesStubs.spyGetSavedQueries();
    HomeSteps.visitAndWaitLoader();
    cy.wait('@getRepositories');
    cy.wait('@getActiveLocations');
  });

  afterEach(() => {
    cy.deleteRepository(repositoryId);
  });

  it('should render repository errors widget', () => {
    HomeSteps.getRepositoryErrorsWidget().should('be.visible');
    RepositoryErrorsWidgetSteps.getInfoMessage().should('contain', 'Some functionalities are not available because you are not connected to any repository.');
    RepositoryErrorsWidgetSteps.getCreateRepositoryBtn().should('be.visible');
    RepositoryErrorsWidgetSteps.getShowRemoteLocationsBtn().should('be.visible');
  });

  // This test is unreliable with the current implementation of the license widget.
  it.skip('should not render active repository widget', () => {
    HomeSteps.getActiveRepositoryWidget().should('be.hidden');
  });

  it('should not render saved SPARQL queries widget', () => {
    cy.wait('@getSavedQueries');
    HomeSteps.getSavedSparqlQueriesWidget().should('be.hidden');
  });

  it('should render repository errors widget', () => {
    RepositoryErrorsWidgetSteps.getRepositoryList().should('contain', repositoryId);
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
});
