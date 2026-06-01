import {inject, Injectable} from '@angular/core';
import {ConfirmationService} from 'primeng/api';
import {TranslocoService} from '@jsverse/transloco';
import {ConfirmationConfig} from './model/confirmation-config';

/**
 * Service for displaying confirmation dialogs across the application.
 * Utilizes PrimeNG's ConfirmationService to show dialogs with customizable messages, headers, and button configurations.
 */
@Injectable({
  providedIn: 'root',
})
export class ConfirmationProviderService {
  private readonly confirmationService = inject(ConfirmationService);
  private readonly translocoService = inject(TranslocoService);

  /**
   * Displays a confirmation dialog with the provided configuration.
   * @param config The configuration for the confirmation dialog, including message, header, button labels, and handlers.
   */
  confirm(config: ConfirmationConfig) {
    this.confirmationService.confirm({
      target: config.target,
      message: config.message,
      header: config.header,
      acceptButtonStyleClass: config.acceptButton?.styleClass || 'confirm-btn',
      rejectButtonStyleClass: config.rejectButton?.styleClass || 'cancel-btn',
      acceptButtonProps: {
        label: config.acceptButton?.label || this.translocoService.translate('components.dialog.confirmation.confirm_btn'),
        severity: config.acceptButton?.type || 'primary',
      },
      rejectButtonProps: {
        label: config.rejectButton?.label || this.translocoService.translate('components.dialog.confirmation.cancel_btn'),
        severity: config.rejectButton?.type || 'secondary',
      },
      accept: config.acceptHandler,
      reject: config.rejectHandler,
      rejectVisible: config.rejectVisible ?? true,
    });
  }

  /**
   * Displays a confirmation dialog with only an accept button, hiding the reject button. The reject button will be
   * hidden in this dialog.
   * @param config The configuration for the confirmation dialog.
   */
  confirmOnly(config: ConfirmationConfig) {
    const resolvedConfig: ConfirmationConfig = {
      ...config,
      rejectVisible: false,
      acceptButton: {
        ...config.acceptButton ?? {},
        label: this.translocoService.translate('components.dialog.confirmation.ok_btn'),
      }
    };
    this.confirm(resolvedConfig);
  }
}
