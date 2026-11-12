import {
  service,
  EventService,
  AuthenticationService,
  EventName,
  notify,
  Notification, NotificationParam,
} from '@ontotext/workbench-api';
import {LoggerProvider} from '../../services/logger-provider';

/**
 * Registers handlers for authentication-related events.
 *
 * When a logout is requested, the current user is logged out through the authentication service.
 * After the logout completes, a localized success notification is displayed as a toast.
 *
 * This function should be called once during application bootstrap to avoid registering duplicate event subscriptions.
 *
 * @returns A promise that resolves once the handlers are subscribed; it never rejects.
 */
export const registerAuthenticationEventHandlers = (): Promise<void> => {
  const eventService = service(EventService);
  const authenticationService = service(AuthenticationService);

  eventService.subscribe(EventName.LOGOUT, () => {
    authenticationService.logout()
      .catch((error) => LoggerProvider.logger.error('Could not sign out', error));
  });
  eventService.subscribe(EventName.LOGGED_OUT, () => {
    notify(
      Notification.success('logout.success')
        .withParameters({
          [NotificationParam.SHOULD_TOAST]: true,
        }),
    );
  });
  return Promise.resolve();
};
