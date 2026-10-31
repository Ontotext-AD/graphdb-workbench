import {OperationsNotificationSteps} from "../../steps/operations-notification/operations-notification.steps";

const assertGroupCount = (index, textValue) => {
  OperationsNotificationSteps.getHeaderGroups()
    .eq(index)
    .invoke('text')
    .should('equal', textValue)
};

const assertNewWindowLink = (index, href) => {
  OperationsNotificationSteps.getOperationsDropdownElements().eq(index)
    .should('have.attr', 'href', href)
    .and('have.attr', 'target', '_blank');
}

describe('onto-operations-notification', () => {
  beforeEach(() => {
    // Given, I am on the operations notification page and I have added mock operations
    OperationsNotificationSteps.visit();
    OperationsNotificationSteps.disableSecurity();
  })

  it('should display operations notification', () => {
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
    OperationsNotificationSteps.getVisibleOperationTexts().should('deep.equal', operationNames);
  });

  it('should link to the operation specific href in a new window', () => {
    OperationsNotificationSteps.visit();
    // simulate repository selection to trigger request for operations
    OperationsNotificationSteps.loadRepositories();
    OperationsNotificationSteps.getRepositoryItems().should('have.length', 6);
    OperationsNotificationSteps.setMarvelRepo();

    // When, I open the dropdown
    OperationsNotificationSteps.getDropdownButton().click();

    // Then, I expect each operation to link to its specific href in a new window
    const operationLinks = ['cluster', 'monitor/backup-and-restore', 'import', 'monitor/queries', 'monitor/queries'];
    operationLinks.forEach((link, index) => assertNewWindowLink(index, link));
  });
})
