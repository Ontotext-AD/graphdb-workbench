import {Component, computed, effect, inject, input, output, signal, viewChild} from '@angular/core';
import {TranslocoPipe, TranslocoService} from '@jsverse/transloco';
import {Button} from 'primeng/button';
import {Popover} from 'primeng/popover';
import {FileUpload, FileUploadHandlerEvent} from 'primeng/fileupload';
import {GraphNavigatorSettings} from '@ontotext/workbench-api';
import {ConfirmationProviderService} from '../../../services/dialog/confirmation-provider.service';

/**
 * The Settings button of the Reactodia page and its popover, where a repository maintainer uploads,
 * exports or resets the repository's graph-navigator settings.
 *
 * The component only renders and asks: it confirms the destructive actions and emits them, and reflects
 * the {@link loading} state the page reports back. The page owns the settings and performs the requests.
 */
@Component({
  selector: 'app-reactodia-settings',
  standalone: true,
  imports: [
    Button,
    Popover,
    FileUpload,
    TranslocoPipe
  ],
  templateUrl: './reactodia-settings.component.html',
  styleUrl: './reactodia-settings.component.scss'
})
export class ReactodiaSettingsComponent {
  private readonly confirmationProviderService = inject(ConfirmationProviderService);
  private readonly translocoService = inject(TranslocoService);

  private readonly fileUpload = viewChild<FileUpload>('fileUpload');

  /** The current settings of the repository. */
  readonly settings = input.required<GraphNavigatorSettings>();
  /** Whether the page is running the request of the last emitted action. */
  readonly loading = input(false);

  /** Emits the settings file the user confirmed to upload. */
  readonly uploadSettings = output<File>();
  /** Emits when the user confirmed resetting the settings to the defaults. */
  readonly resetSettings = output<void>();
  /** Emits when the user asked for the current settings to be exported. */
  readonly exportSettings = output<void>();

  /** Whether a confirmation dialog is open. */
  private readonly confirming = signal(false);

  /**
   * The popover must not close while the user clicks in the confirmation dialog, or while the request is
   * running, so that it stays open, with the file still selected, when the upload fails.
   */
  readonly dismissable = computed(() => !this.confirming() && !this.loading());

  constructor() {
    // New settings mean the page applied an upload or a reset, so the selected file is done with. A failed
    // request leaves the settings, and therefore the file, as they are, so the user can correct it and retry.
    effect(() => {
      this.settings();
      this.fileUpload()?.clear();
    });
  }

  confirmUpload(event: FileUploadHandlerEvent): void {
    const file = event.files[0];
    if (!file) {
      return;
    }
    this.confirm(
      'reactodia.settings.confirm.upload.title',
      'reactodia.settings.confirm.upload.message',
      () => this.uploadSettings.emit(file)
    );
  }

  confirmReset(): void {
    this.confirm(
      'reactodia.settings.confirm.reset.title',
      'reactodia.settings.confirm.reset.message',
      () => this.resetSettings.emit()
    );
  }

  private confirm(headerKey: string, messageKey: string, acceptHandler: () => void): void {
    this.confirming.set(true);
    this.confirmationProviderService.confirm({
      header: this.translocoService.translate(headerKey),
      message: this.translocoService.translate(messageKey),
      acceptHandler: () => {
        this.releasePopover();
        acceptHandler();
      },
      rejectHandler: () => this.releasePopover()
    });
  }

  /**
   * Lets the popover close on outside clicks again. Deferred, so the click on the dialog button that is still
   * being dispatched does not close it.
   */
  private releasePopover(): void {
    setTimeout(() => this.confirming.set(false));
  }
}
