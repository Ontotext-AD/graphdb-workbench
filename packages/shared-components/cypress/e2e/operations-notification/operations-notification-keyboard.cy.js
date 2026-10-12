import {OperationsNotificationSteps} from "../../steps/operations-notification/operations-notification.steps";

describe('onto-operations-notification keyboard access', () => {
  beforeEach(() => {
    // Given, I am on the operations notification page and there are running operations
    OperationsNotificationSteps.visit();
    OperationsNotificationSteps.disableSecurity();
    OperationsNotificationSteps.loadRepositories();
    OperationsNotificationSteps.getRepositoryItems().should('have.length', 6);
    OperationsNotificationSteps.setMarvelRepo();
    OperationsNotificationSteps.getDropdownButton().should('be.visible');
  });

  it('should have a named toggle button, which exposes the open state', () => {
    // Then, the toggle button should be named by a text for screen readers, which keeps the operation counts in the name
    OperationsNotificationSteps.getDropdownButton()
      .should('have.attr', 'aria-expanded', 'false');
    OperationsNotificationSteps.getDropdownButton().should('not.have.attr', 'aria-label');
    OperationsNotificationSteps.getDropdownButtonScreenReaderText().should('have.text', 'Running operations');

    // When, I open the dropdown with the keyboard
    OperationsNotificationSteps.focusDropdownButton();
    OperationsNotificationSteps.pressEnter();

    // Then, the toggle button should be expanded
    OperationsNotificationSteps.getDropdownButton().should('have.attr', 'aria-expanded', 'true');
  });

  it('should open an operation with the keyboard', () => {
    // When, I open the dropdown with the keyboard and tab to the first operation
    OperationsNotificationSteps.focusDropdownButton();
    OperationsNotificationSteps.pressEnter();
    OperationsNotificationSteps.pressTab();

    // Then, the first operation should be a focused link to its view, which opens in the same window
    OperationsNotificationSteps.getOperationsDropdownElements().eq(0)
      .should('be.focused')
      .and('have.attr', 'href', 'cluster')
      .and('not.have.attr', 'target');

    // When, I activate it
    OperationsNotificationSteps.pressEnter();

    // Then, I should be redirected to the operation view
    OperationsNotificationSteps.verifyRedirectUrl('cluster');
  });

  it('should close the dropdown on Escape and return the focus to the toggle button', () => {
    // Given, I opened the dropdown and moved the focus into it
    OperationsNotificationSteps.focusDropdownButton();
    OperationsNotificationSteps.pressEnter();
    OperationsNotificationSteps.pressTab();

    // When, I press Escape
    OperationsNotificationSteps.pressEscape();

    // Then, the dropdown should be closed
    OperationsNotificationSteps.getOperationsDropdownElements().should('not.exist');
    // And, the focus should be on the toggle button
    OperationsNotificationSteps.getDropdownButton()
      .should('be.focused')
      .and('have.attr', 'aria-expanded', 'false');
  });
});
