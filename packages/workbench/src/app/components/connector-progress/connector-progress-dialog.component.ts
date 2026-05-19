import {Component, inject} from '@angular/core';
import {DynamicDialogConfig, DynamicDialogRef} from 'primeng/dynamicdialog';
import {ConnectorProgressComponent} from './connector-progress.component';
import {ConnectorProgressData} from './connector-progress-data';

/**
 * Thin dialog wrapper around {@link ConnectorProgressComponent}.
 * Opened via {@link DialogProviderService} and delegates close to the dialog ref.
 */
@Component({
  selector: 'app-connector-progress-dialog',
  standalone: true,
  imports: [ConnectorProgressComponent],
  template: '<app-connector-progress [connectorProgressData]="data" (closed)="dialogRef.close()" />'
})
export class ConnectorProgressDialogComponent {
  protected readonly dialogRef = inject(DynamicDialogRef);
  private readonly dialogConfig = inject(DynamicDialogConfig<ConnectorProgressData>);

  readonly data = this.dialogConfig.data!;
}
