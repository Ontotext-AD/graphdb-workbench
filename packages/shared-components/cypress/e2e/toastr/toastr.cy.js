import {ToastrSteps} from "../../steps/toastr/toastr-steps";

const assertToastMessage = (toastClass, toastIconClass) => {
  ToastrSteps.getVisibleToasts()
    .first()
    .should('have.class', toastClass)
    .and('contain', 'This is a toast message')
    .find('i')
    .should('have.class', toastIconClass);
}

describe('OntoToastr', () => {
  beforeEach(() => {
    cy.on('window:before:load', (win) => {
      win.crypto.randomUUID = () => '123e4567-e89b-12d3-a456-426655440000';
    });
  });

  it('should display different toast types', () => {
    // Given I visit the onto-toastr page
    ToastrSteps.visit();

    // When I click on the success toast button
    ToastrSteps.clickSuccessToastButton();

    // Then I expect a success toast to be displayed
    ToastrSteps.getVisibleToasts().should('have.length', 1);
    assertToastMessage('success', 'fa-circle-check');

    // When I click on the info toast button
    ToastrSteps.clickInfoToastButton();

    // Then I expect an info toast to be displayed
    ToastrSteps.getVisibleToasts().should('have.length', 2);
    assertToastMessage('info', 'fa-circle-info');

    // When I click on the warning toast button
    ToastrSteps.clickWarningToastButton();

    // Then I expect a warning toast to be displayed
    ToastrSteps.getVisibleToasts().should('have.length', 3);
    assertToastMessage('warning', 'fa-message-lines');

    // When I click on the error toast button
    ToastrSteps.clickErrorToastButton();

    // Then I expect an error toast to be displayed
    ToastrSteps.getVisibleToasts().should('have.length', 4);
    assertToastMessage('error', 'fa-triangle-exclamation');

    // And messages should disappear after 5 seconds
    ToastrSteps.getVisibleToasts().should('have.length', 0);
  });

  it('should render markup correctly', () => {
    // Given I visit the onto-toastr page
    ToastrSteps.visit();

    // When, I display a toast, containing an HTML anchor tag
    ToastrSteps.clickLinkToastButton();

    // Then, the toast should contain a valid anchor tag
    ToastrSteps.getVisibleToasts()
      .first()
      .find('a')
      .should('have.attr', 'href', '#')
      .and('contain.text', 'Click here for more information');
  });
});
