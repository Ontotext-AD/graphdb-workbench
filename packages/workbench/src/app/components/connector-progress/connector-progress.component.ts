import {Component, EventEmitter, Input, OnDestroy, OnInit, Output, signal} from '@angular/core';
import {TranslocoPipe} from '@jsverse/transloco';
import {ProgressBar} from 'primeng/progressbar';
import {ConnectorBuildStatus, ConnectorsService, DateUtil, RepositoryStorageService, service} from '@ontotext/workbench-api';
import {ConnectorProgressData} from './connector-progress-data';
import {LoggerProvider} from '../../services/logger/logger-provider';

/**
 * Component that shows live build progress for a connector CREATE or REPAIR operation.
 *
 * Polls the connector status every second via {@link ConnectorsService.getConnectorBuildStatus}
 * and emits {@link ConnectorProgressComponent.closed} when the status reaches `BUILT` or on error.
 * Can be used standalone (set {@link ConnectorProgressComponent.inline} to true) or hosted inside
 * {@link ConnectorProgressDialogComponent}.
 */
@Component({
  selector: 'app-connector-progress',
  standalone: true,
  imports: [TranslocoPipe, ProgressBar],
  templateUrl: './connector-progress.component.html'
})
export class ConnectorProgressComponent implements OnInit, OnDestroy {
  private readonly logger = LoggerProvider.logger;

  private readonly connectorsService = service(ConnectorsService);
  private readonly repositoryStorageService = service(RepositoryStorageService);

  private readonly pollDelay = 1000;

  private pollInterval?: ReturnType<typeof setInterval>;

  @Input({ required: true }) connectorProgressData!: ConnectorProgressData;
  @Input() inline = false;

  @Output() readonly closed = new EventEmitter<void>();

  readonly buildStatus = signal<ConnectorBuildStatus>(new ConnectorBuildStatus());
  readonly eta = signal('-');

  ngOnInit(): void {
    this.pollInterval = setInterval(() => this.pollStatus(), this.pollDelay);
  }

  ngOnDestroy(): void {
    clearInterval(this.pollInterval);
  }

  private pollStatus(): void {
    const repositoryId = this.repositoryStorageService.getActiveRepositoryId();
    if (!repositoryId) {
      return;
    }
    this.connectorsService.getConnectorBuildStatus(this.connectorProgressData.iri, repositoryId)
      .then((status) => {
        if (!status) {
          return;
        }
        this.buildStatus.set(status);
        this.eta.set(DateUtil.formatDuration(status.etaSeconds));
        if (status.isBuilt) {
          clearInterval(this.pollInterval);
          this.closed.emit();
        }
      }).catch((error) => {
        this.logger.error('Error fetching connector build status:', error);
        clearInterval(this.pollInterval);
        this.closed.emit();
      });
  }
}
