import {
  service,
  EventService,
  AuthenticationService,
  LanguageContextService,
  TranslationUtil,
  EventName,
  notify,
  Notification, NotificationType, NotificationParam,
} from '@ontotext/workbench-api';

/**
 * Registers handlers for authentication-related events.
 *
 * When a logout is requested, the current user is logged out through the authentication service.
 * After the logout completes, a localized success notification is displayed as a toast.
 *
 * This function should be called once during application bootstrap to avoid registering duplicate event subscriptions.
 */
export const registerAuthenticationEventHandlers = (): void => {
  service(EventService).subscribe(EventName.LOGOUT, () => service(AuthenticationService).logout());
  service(EventService).subscribe(EventName.LOGGED_OUT, () => {
    const languageContextService = service(LanguageContextService);
    const bundle = languageContextService.getLanguageBundle() ?? languageContextService.getDefaultBundle();
    const title = TranslationUtil.translate(bundle, 'logout.success') ?? 'logout.success';
    notify(
      new Notification('')
        .withType(NotificationType.SUCCESS)
        .withTitle(title)
        .withParameters({
          [NotificationParam.SHOULD_TOAST]: true,
        }),
    );
  });
};
