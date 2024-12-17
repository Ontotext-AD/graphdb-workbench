import {RepositorySelectorSteps} from "../../steps/header/repository-selector-steps";

describe("Repository Selector", () => {

  it('Should select repository', () => {
    // When I visit a page with repository selector in it.
    RepositorySelectorSteps.visit();
    // Then I expect to see only toggle selector button with default label, because the repository is not selected,
    RepositorySelectorSteps.getRepositorySelectorToggleButton()
      .should('be.visible')
      .and('contain', 'Choose repository');
    // and the menu with repository items be not visible.
    RepositorySelectorSteps.getRepositorySelectorItemMenu().should('not.be.visible');

    // When I click on repository button
    RepositorySelectorSteps.toggleRepositorySelector();
    // Ten I expect the menu with repository items be visible.
    RepositorySelectorSteps.getRepositorySelectorItemMenu().should('be.visible');

    // When I select a repository
    RepositorySelectorSteps.selectRepositorySelectorItem(2);
    // Then I expect the menu with repositories be not visible
    RepositorySelectorSteps.getRepositorySelectorItemMenu().should('not.be.visible');
    // and selector button to contains the id of selected repository
    RepositorySelectorSteps.getRepositorySelectorToggleButton().contains('starwars4');

    // TODO: For some reason the tooltip can't be triggered by cypress here
    // RepositorySelectorSteps.getRepositorySelectorToggleButton().trigger('mouseover');
  });
});
