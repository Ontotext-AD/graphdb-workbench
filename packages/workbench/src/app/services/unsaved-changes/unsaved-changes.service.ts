import {inject, Injectable} from '@angular/core';
import {
  service,
  EventService,
  EventName,
  NavigationStartPayload,
  Subscription,
  SubscriptionList
} from '@ontotext/workbench-api';
import {ConfirmationService} from 'primeng/api';
import {TranslocoService} from '@jsverse/transloco';

/**
 * Coordinates unsaved-changes detection across the application.
 *
 * Callers register a callback via {@link register}, which returns a {@link Subscription}
 * that removes the callback when invoked. When a `NAVIGATION_START` event fires and at least
 * one registered callback returns `true`, the service intercepts navigation and shows a
 * confirmation dialog. The user can then allow or cancel the navigation.
 */
@Injectable({
  providedIn: 'root'
})
export class UnsavedChangesService {
  private readonly callbacks = new SubscriptionList();
  private readonly eventService = service(EventService);
  private readonly translocoService = inject(TranslocoService);
  private readonly confirmationService = inject(ConfirmationService);

  constructor() {
    this.subscribeToNavigationStart();
  }

  /**
   * Registers `callback` to be consulted before each navigation. Returns a {@link Subscription}
   * that, when called, removes the callback so it no longer blocks navigation.
   */
  public register(callback: () => boolean): Subscription {
    this.callbacks.add(callback);
    return () => this.callbacks.remove(callback);
  }

  private subscribeToNavigationStart() {
    this.eventService.subscribe(EventName.NAVIGATION_START, (eventPayload: NavigationStartPayload) => this.onNavigationStart(eventPayload));
  }

  private async onNavigationStart(eventPayload: NavigationStartPayload) {
    if (!this.callbacks.size || !this.hasAnyUnsavedChanges()) {
      return;
    }

    eventPayload.cancelNavigation(this.confirmUnsavedChanges());
  }

  private hasAnyUnsavedChanges() {
    return this.callbacks.getItems().some(callback => callback());
  }

  private readonly confirmUnsavedChanges = () => {
    return new Promise<boolean>((resolve) => {
      return this.confirmationService.confirm({
        header: this.translocoService.translate('components.dialog.confirmation.title'),
        message: this.translocoService.translate('components.dialog.confirmation.message'),
        acceptButtonProps: {
          label: this.translocoService.translate('components.dialog.confirmation.confirm_btn'),
          severity: 'primary'
        },
        rejectButtonProps: {
          label: this.translocoService.translate('components.dialog.confirmation.cancel_btn'),
          severity: 'secondary'
        },
        accept: () => {
          resolve(false);
        },
        reject: () => {
          resolve(true);
        }
      });
    });
  };
}
