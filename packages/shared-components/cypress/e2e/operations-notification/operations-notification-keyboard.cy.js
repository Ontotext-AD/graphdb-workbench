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

  it('should reach an operation with the keyboard, which opens in a new window', () => {
    // When, I open the dropdown with the keyboard and tab to the first operation
    OperationsNotificationSteps.focusDropdownButton();
    OperationsNotificationSteps.pressEnter();
    OperationsNotificationSteps.pressTab();

    // Then, the first operation should be a focused link to its view, which opens in a new window
    OperationsNotificationSteps.getOperationsDropdownElements().eq(0)
      .should('be.focused')
      .and('have.attr', 'href', 'cluster')
      .and('have.attr', 'target', '_blank')
      .and('have.attr', 'rel', 'noopener noreferrer');
    // And, it should tell the screen readers that it opens in a new window
    OperationsNotificationSteps.getOperationScreenReaderText(0).should('have.text', ' (opens in a new window)');
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
