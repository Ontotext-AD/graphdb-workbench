import {MainMenuSteps} from "../../../steps/main-menu-steps";
import HomeSteps from "../../../steps/home-steps";
import {SettingsSteps} from "../../../steps/setup/settings-steps";

function verifyInitialState(repositoryId) {
  // Password change field is for admin.
  // explicitly state that the fields must be of type password
  SettingsSteps.getPasswordField().should('be.visible')
    .and('have.value', '')
    .and('have.attr', 'placeholder', 'New password');
  SettingsSteps.getConfirmPasswordField().should('be.visible')
    .and('have.value', '')
    .and('have.attr', 'placeholder', 'Confirm password');

  // SPARQL settings are as follows:
  // -Expand over sameAs is on
  // -Inference is on
  // -Count total results is checked
  // -Ignore saved queries is not checked
  SettingsSteps.getSparqlEditorPanel().should('be.visible');
  SettingsSteps.getSameAsToggle().should('be.checked');
  SettingsSteps.getSameAsLabel().should('be.visible')
    .and('contain', 'Expand results over owl:SameAs is')
    .find('.tag').should('be.visible')
    .and('contain', 'ON');
  SettingsSteps.getInferenceToggle().should('be.checked');
  SettingsSteps.getInferenceLabel().should('be.visible')
    .and('contain', 'Inference is')
    .find('.tag').should('be.visible')
    .and('contain', 'ON');
  SettingsSteps.getCountCheckbox().should('be.checked');
  SettingsSteps.getIgnoreSharedCheckbox().should('not.be.checked');

  // User role
  // - User role is administrator (both cannot be changed)
  SettingsSteps.getUserRoleRadioButton()
    .should('be.checked')
    .and('be.disabled')
    .and('have.value', 'admin');
  SettingsSteps.getRepoManagerRadioButton()
    .should('not.be.checked')
    .and('be.disabled');
  SettingsSteps.getAdminRadioButton()
    .should('not.be.checked')
    .and('be.disabled');

  // Repository rights
  // - Admin has read and write access to all repositories."
  SettingsSteps.getUserRepositoryTable().should('be.visible');
  SettingsSteps.getReadRightsCheckbox(repositoryId)
    .should('be.visible')
    .and('be.checked')
    .and('be.disabled');
  SettingsSteps.getWriteRightsCheckbox(repositoryId)
    .should('be.visible')
    .and('be.checked')
    .and('be.disabled');
}

describe('My Settings initial state', () => {
  let repositoryId;
  beforeEach(() => {
    repositoryId = 'my-settings-' + Date.now();
    cy.createRepository({id: repositoryId});
    cy.presetRepository(repositoryId);
  });

  afterEach(() => {
    cy.deleteRepository(repositoryId);
  });

  it('Should display the correct initial state when navigating via URL', () => {
    // Given, I visit the My Settings page via URL
    SettingsSteps.visit();
    // Then,
    verifyInitialState(repositoryId);
  });

  it('Should display the correct initial state when navigating via the navigation bar', () => {
    // Given, I visit the My Settings page via the navigation menu
    HomeSteps.visit();
    MainMenuSteps.clickOnMySettings();
    // Then,
    verifyInitialState(repositoryId);
  });
});
