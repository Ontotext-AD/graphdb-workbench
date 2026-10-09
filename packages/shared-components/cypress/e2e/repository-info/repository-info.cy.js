import {RepositoryInfoSteps} from '../../steps/repository-info/repository-info-steps';
import {LanguageSelectorSteps} from '../../steps/language-selector/language-selector-steps';

describe('OntoRepositoryInfo', () => {
  beforeEach(() => {
    RepositoryInfoSteps.visit();
  });

  it('should show the information and the statement counts of a running repository', () => {
    RepositoryInfoSteps.getPart('repository-info-running', 'title').should('have.text', 'starwars');
    RepositoryInfoSteps.getStateIcon('repository-info-running').should('have.class', 'ri-checkbox-blank-circle-fill');
    RepositoryInfoSteps.getPart('repository-info-running', 'description').should('have.text', 'Star Wars data');
    RepositoryInfoSteps.getPart('repository-info-running', 'location').should('contain.text', 'Local');
    RepositoryInfoSteps.getPart('repository-info-running', 'type').should('contain.text', 'Graphdb');
    RepositoryInfoSteps.getPart('repository-info-running', 'permissions').should('contain.text', 'Read/Write');
    RepositoryInfoSteps.getPart('repository-info-running', 'total').should('contain.text', '4,425');
    RepositoryInfoSteps.getPart('repository-info-running', 'explicit').should('contain.text', '3,978');
    RepositoryInfoSteps.getPart('repository-info-running', 'inferred').should('contain.text', '447');
    RepositoryInfoSteps.getPart('repository-info-running', 'expansion-ratio').should('contain.text', '1.11');
  });

  it('should show a spinner while the statement counts are loading', () => {
    RepositoryInfoSteps.getPart('repository-info-loading-counts', 'location').should('contain.text', 'http://remote:7200');
    RepositoryInfoSteps.getPart('repository-info-loading-counts', 'loading').should('be.visible');
    RepositoryInfoSteps.getPart('repository-info-loading-counts', 'total').should('not.exist');
  });

  it('should show that the statement counts are not available', () => {
    RepositoryInfoSteps.getPart('repository-info-no-counts', 'not-available')
      .should('contain.text', 'Size info not available.');
    RepositoryInfoSteps.getPart('repository-info-no-counts', 'total').should('not.exist');
  });

  it('should show the activation message for a repository that is not running', () => {
    RepositoryInfoSteps.getStateIcon('repository-info-inactive-repository').should('have.class', 'ri-stop-large-fill');
    RepositoryInfoSteps.getPart('repository-info-inactive-repository', 'inactive')
      .should('contain.text', 'Activate the repository to view statement information');
    RepositoryInfoSteps.getPart('repository-info-inactive-repository', 'total').should('not.exist');

    RepositoryInfoSteps.getStateIcon('repository-info-starting-repository').should('have.class', 'ri-loop-left-fill');
    RepositoryInfoSteps.getPart('repository-info-starting-repository', 'inactive').should('be.visible');
  });

  it('should follow a change of the language', () => {
    LanguageSelectorSteps.openLanguageSelectorDropdown();
    LanguageSelectorSteps.selectLanguage(1);

    RepositoryInfoSteps.getPart('repository-info-running', 'total')
      .should('contain.text', 'Total des déclarations')
      .and('contain.text', '4 425');
    RepositoryInfoSteps.getPart('repository-info-running', 'expansion-ratio').should('contain.text', '1,11');
  });
});
