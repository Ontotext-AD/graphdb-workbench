import {HeaderSteps} from "../../steps/header/header-steps";

describe('Header', () => {
  it('Should render header and various tools inside', () => {
    // Given I visit the header page
    HeaderSteps.visit();
    // Then I should see the header
    HeaderSteps.getHeader().should('be.visible');
    // And I should see the language selector
    HeaderSteps.getLanguageSelector().should('be.visible');
    // And I should see the repository selector
    HeaderSteps.getRepositorySelector().should('be.visible');
    // And I should see the search component
    HeaderSteps.getSearch().should('be.visible');
  });
});
