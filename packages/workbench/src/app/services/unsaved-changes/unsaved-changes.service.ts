import {inject, Injectable} from '@angular/core';
import {UnsavedChanges} from '../../models/unsaved-changes/unsaved-changes';
import {service, EventService, EventName, NavigationStartPayload} from '@ontotext/workbench-api';
import {ConfirmationService} from 'primeng/api';
import {TranslocoService} from '@jsverse/transloco';

/**
 * Coordinates unsaved-changes detection across the application.
 *
 * Components register themselves via {@link registerComponent} and implement
 * {@link UnsavedChanges}. When a `NAVIGATION_START` event fires and at least one
 * registered component reports unsaved changes, the service intercepts navigation and
 * shows a confirmation dialog. The user can then allow or cancel the navigation.
 */
@Injectable({
  providedIn: 'root'
})
export class UnsavedChangesService {
  private readonly components = new Set<UnsavedChanges>();
  private readonly eventService = service(EventService);
  private readonly translocoService = inject(TranslocoService);
  private readonly confirmationService = inject(ConfirmationService);

  constructor() {
    this.subscribeToNavigationStart();
  }

  /**
   * Adds `component` to the set of components whose unsaved state is checked before navigation.
   */
  public registerComponent(component: UnsavedChanges) {
    this.components.add(component);
  }

  /**
   * Removes `component` from the set so it no longer blocks navigation.
   */
  public unregisterComponent(component: UnsavedChanges) {
    this.components.delete(component);
  }

  private subscribeToNavigationStart() {
    this.eventService.subscribe(EventName.NAVIGATION_START, (eventPayload: NavigationStartPayload) => this.onNavigationStart(eventPayload));
  }

  private async onNavigationStart(eventPayload: NavigationStartPayload) {
    if (!this.components.size || !this.hasAnyUnsavedChanges()) {
      return;
    }

    eventPayload.cancelNavigation(this.confirmUnsavedChanges());
  }

  private hasAnyUnsavedChanges() {
    return [...this.components].some(component => component.hasUnsavedChanges());
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
