import HomeSteps from '../../steps/home-steps';
import {LicenseWidgetSteps} from "../../steps/widgets/license-widget-steps";
import {ActiveRepositoryWidgetSteps} from "../../steps/widgets/active-repository-widget-steps";
import {RepositoriesStubs} from "../../stubs/repositories/repositories-stubs";
import {SavedSparqlQueriesWidgetSteps} from "../../steps/widgets/saved-sparql-queries-widget-steps";
import {SavedQueriesStubs} from "../../stubs/saved-queries-stubs";
import {LicenseStubs} from "../../stubs/license-stubs";

describe('Home page: with selected repository', () => {

  let repositoryId;

  beforeEach(() => {
    cy.viewport(1280, 1000);
    repositoryId = 'home-page-' + Date.now();
    cy.createRepository({id: repositoryId});
    cy.presetRepository(repositoryId);
    RepositoriesStubs.spyGetRepositories();
    SavedQueriesStubs.spyGetSavedQueries();
    LicenseStubs.spyGetLicense();
    HomeSteps.visitAndWaitLoader();
    cy.wait('@getRepositories');
  });

  afterEach(() => {
    cy.deleteRepository(repositoryId);
  });

  it('should render page header with tools', () => {
    // RDF search box should not be visible when there is no selected repository
    HomeSteps.getRDFSearchButton().should('not.be.visible');
    // Repository selector menu should be visible and empty
    HomeSteps.getRepositorySelector().should('be.visible');
    HomeSteps.getSelectedRepository().should('contain', repositoryId);
    // Language selector menu should be visible and default to English
    HomeSteps.getLanguageSelector().should('be.visible');
    HomeSteps.getSelectedLanguage().should('contain', 'en');
  });

  it('should render active repository widget', () => {
    HomeSteps.getActiveRepositoryWidget().should('be.visible');
    ActiveRepositoryWidgetSteps.getWidget().should('be.visible');
    ActiveRepositoryWidgetSteps.getActiveRepository().should('contain', repositoryId);
    ActiveRepositoryWidgetSteps.getWidgetName().should('contain', 'Active repository');
    ActiveRepositoryWidgetSteps.getTotalStatements().should('contain', 70);
    ActiveRepositoryWidgetSteps.getInferredStatements().should('contain', 70);
    ActiveRepositoryWidgetSteps.getExplicitStatements().should('contain', 0);
  });

  it('should not render repository errors widget', () => {
    HomeSteps.getRepositoryErrorsWidget().should('be.hidden');
  });

  it('should render saved SPARQL queries widget', () => {
    cy.wait('@getSavedQueries');
    HomeSteps.getSavedSparqlQueriesWidget().should('be.visible');
    SavedSparqlQueriesWidgetSteps.getWidgetName().should('contain', 'Saved SPARQL queries');
  });

  it('should render license widget', () => {
    cy.wait('@get-license');
    HomeSteps.getLicenseWidget().should('be.visible');
    LicenseWidgetSteps.getLicenseWidgetHeader().should('contain', 'License');
  });

  it('should render page footer', () => {
    HomeSteps.getPageFooter().should('be.visible');
  });
});
