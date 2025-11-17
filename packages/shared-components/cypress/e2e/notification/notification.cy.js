import {ToastrSteps} from "../../steps/toastr/toastr-steps";
import {NotificationSteps} from "../../steps/notification/notification-steps";

const assertToastMessage = (toastClass, toastIconClass) => {
  ToastrSteps.getVisibleToasts()
    .first()
    .should('have.class', toastClass)
    .and('contain', 'Title of notification message')
    .and('contain', 'This is a notification message')
    .find('i')
    .should('have.class', toastIconClass);
}

describe('Notification', () => {
  it('should display toast messages upon notification', () => {
    // Given I visit the notification page
    NotificationSteps.visit();

    // When I click on the success notification button
    NotificationSteps.clickSuccessNotificationButton();

    // Then I expect a success toastr to be displayed
    ToastrSteps.getVisibleToasts().should('have.length', 1);
    assertToastMessage('success', 'ri-checkbox-circle-line');

    // When I click on the info notification button
    NotificationSteps.clickInfoNotificationButton();

    // Then I expect an info toastr to be displayed
    ToastrSteps.getVisibleToasts().should('have.length', 2);
    assertToastMessage('info', 'ri-information-2-fill');

    // When I click on the warning notification button
    NotificationSteps.clickWarningNotificationButton();

    // Then I expect a warning toastr to be displayed
    ToastrSteps.getVisibleToasts().should('have.length', 3);
    assertToastMessage('warning', 'ri-message-line');

    // When I click on the error notification button
    NotificationSteps.clickErrorNotificationButton();

    // Then I expect an error toastr to be displayed
    ToastrSteps.getVisibleToasts().should('have.length', 4);
    assertToastMessage('error', 'ri-alert-line');

    // And messages should disappear after 5 seconds
    ToastrSteps.getVisibleToasts().should('have.length', 0);
  });
});
