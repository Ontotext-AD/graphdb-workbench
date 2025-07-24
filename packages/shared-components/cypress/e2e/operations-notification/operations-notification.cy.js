import {OperationsNotificationSteps} from "../../steps/operations-notification/operations-notification.steps";
import {HeaderSteps} from "../../steps/header/header-steps";

const assertGroupCount = (index, textValue) => {
  OperationsNotificationSteps.getHeaderGroups()
    .eq(index)
    .invoke('text')
    .should('equal', textValue)
};

const assertRedirectLink = (index, textValue) => {
  OperationsNotificationSteps.getDropdownButton().click();
  OperationsNotificationSteps.getOperationsDropdownElements().eq(index).click();

  OperationsNotificationSteps.getRedirectUrl()
    .last()
    .invoke('text')
    .should('equal', `redirect to ${textValue}`);
}

describe('onto-operations-notification', () => {
  it('should display operations notification', () => {
    // Given, I am on the operations notification page and I have added mock operations
    OperationsNotificationSteps.visit();
    // simulate repository selection to trigger request for operations
    OperationsNotificationSteps.loadRepositories();
    OperationsNotificationSteps.getRepositoryItems().should('have.length', 6);
    OperationsNotificationSteps.setMarvelRepo();

    // Then, I expect to see the operations notification component
    OperationsNotificationSteps.getOperationsNotification().should('exist');

    // And, I expect to see 4 header groups (query, import, cluster, backup)
    OperationsNotificationSteps.getHeaderGroups()
      .should('exist')
      .should('have.length', 4);

    // And I expect the groups with counts to have correct number of operations
    // Groups without counts should not contain anything
    assertGroupCount(0, '');
    assertGroupCount(1, '');
    assertGroupCount(2, '1');
    assertGroupCount(3, '26');


    const operationNames = ['Unavailable nodes', 'Creating backup', 'Running imports1', 'Running queries25', 'Running updates1'];
    OperationsNotificationSteps.getDropdownButton().click();

    // And I expect the dropdown to contain the operation names
    OperationsNotificationSteps.getOperationsDropdownElements().each(($group, index) => {
      cy.wrap($group.text()).should('equal', operationNames[index]);
    })
  });

  it('should redirect to operation specific href, when clicked', () => {
    // Given, I am on the operations notification page and I have added mock operations
    OperationsNotificationSteps.visit();
    // simulate repository selection to trigger request for operations
    OperationsNotificationSteps.loadRepositories();
    OperationsNotificationSteps.getRepositoryItems().should('have.length', 6);
    OperationsNotificationSteps.setMarvelRepo();

    const operationLinks = ['cluster', 'monitor/backup-and-restore', 'import', 'monitor/queries', 'monitor/queries'];

    // When, I click on each operation link
    operationLinks.forEach((link, index) => {
      // Then, I expect to be redirected to the correct operation specific href
      assertRedirectLink(index, link);
    });
  });
})


