import {Component, computed, effect, inject, input, output, signal, untracked, viewChild} from '@angular/core';
import {TranslocoPipe, TranslocoService} from '@jsverse/transloco';
import {Badge} from 'primeng/badge';
import {Button} from 'primeng/button';
import {Popover} from 'primeng/popover';
import {FileUpload, FileUploadHandlerEvent} from 'primeng/fileupload';
import {TableModule} from 'primeng/table';
import {GraphNavigatorSettings, GraphNavigatorSettingsError} from '@ontotext/workbench-api';
import {ConfirmationProviderService} from '../../../services/dialog/confirmation-provider.service';
import {UpperCasePipe} from '@angular/common';

/**
 * The Settings button of the Graph Navigator page and its popover, where a repository maintainer uploads,
 * exports or resets the repository's graph-navigator settings.
 *
 * The component only renders and asks: it confirms the destructive actions and emits them, and reflects
 * the {@link loading} state the page reports back. The page owns the settings and performs the requests.
 */
@Component({
  selector: 'app-graph-navigator-settings',
  standalone: true,
  imports: [
    Badge,
    Button,
    Popover,
    FileUpload,
    TableModule,
    TranslocoPipe,
    UpperCasePipe
  ],
  templateUrl: './graph-navigator-settings.component.html',
  styleUrl: './graph-navigator-settings.component.scss'
})
export class GraphNavigatorSettingsComponent {
  private readonly confirmationProviderService = inject(ConfirmationProviderService);
  private readonly translocoService = inject(TranslocoService);

  private readonly fileUpload = viewChild<FileUpload>('fileUpload');

  /** The current settings of the repository. */
  readonly settings = input.required<GraphNavigatorSettings>();
  /** Whether the page is running the request of the last emitted action. */
  readonly loading = input(false);
  /** The validation errors the backend returned for the last uploaded file. */
  readonly uploadErrors = input<GraphNavigatorSettingsError[]>([]);

  /** Emits the settings file the user confirmed to upload. */
  readonly uploadSettings = output<File>();
  /** Emits when the user confirmed resetting the settings to the defaults. */
  readonly resetSettings = output<void>();
  /** Emits when the user asked for the current settings to be exported. */
  readonly exportSettings = output<void>();
  /** Emits when the selected file changed, so the validation errors of the previous file are dropped. */
  readonly clearUploadErrors = output<void>();

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
      // Untracked, so re-rendering the popover content does not clear the file upload, and the errors with it.
      untracked(() => this.fileUpload()?.clear());
    });
  }

  onFileChanged(): void {
    if (this.uploadErrors().length) {
      this.clearUploadErrors.emit();
    }
  }

  /** The translated problem text of the error, or the backend's message when its code has no translation. */
  translateError(error: GraphNavigatorSettingsError): string {
    const key = `graph_navigator.settings.upload.errors.codes.${error.code}`;
    const problem = this.translocoService.translate(key, {...error, ...error.params});
    return problem === key ? error.message : problem;
  }

  confirmUpload(event: FileUploadHandlerEvent): void {
    const file = event.files[0];
    if (!file) {
      return;
    }
    this.confirm(
      'graph_navigator.settings.confirm.upload.title',
      'graph_navigator.settings.confirm.upload.message',
      () => this.uploadSettings.emit(file)
    );
  }

  confirmReset(): void {
    this.confirm(
      'graph_navigator.settings.confirm.reset.title',
      'graph_navigator.settings.confirm.reset.message',
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
