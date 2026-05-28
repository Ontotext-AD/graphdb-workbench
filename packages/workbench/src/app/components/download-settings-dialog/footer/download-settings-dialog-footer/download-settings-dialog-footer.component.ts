import {Component, inject} from '@angular/core';
import {Button} from 'primeng/button';
import {TranslocoPipe} from '@jsverse/transloco';
import {DynamicDialogConfig, DynamicDialogRef} from 'primeng/dynamicdialog';
import {DownloadSettingsDialogData} from '../../models/download-settings-dialog-data';

@Component({
  selector: 'app-download-settings-dialog-footer',
  imports: [
    Button,
    TranslocoPipe
  ],
  templateUrl: './download-settings-dialog-footer.component.html',
  styleUrl: './download-settings-dialog-footer.component.scss'
})
export class DownloadSettingsDialogFooterComponent {
  private readonly dialogRef = inject(DynamicDialogRef);
  private readonly dialogConfig: DynamicDialogConfig<DownloadSettingsDialogData> = inject(DynamicDialogConfig);

  exportJsonLD() {
    if (this.dialogConfig.data?.exportAction) {
      this.dialogConfig.data?.exportAction();
    }
  }

  reset() {
    if (this.dialogConfig.data?.resetAction) {
      this.dialogConfig.data?.resetAction();
    }
  }

  cancel() {
    this.dialogRef.close();
  }
}
