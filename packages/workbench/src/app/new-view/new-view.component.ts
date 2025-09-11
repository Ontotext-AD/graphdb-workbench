import {Component, CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {AuthenticationService, RepositoryContextService, ServiceProvider, RepositoryList} from '@ontotext/workbench-api';
import {TranslocoPipe} from '@jsverse/transloco';
import {LoggingService} from '../services/logging.service';

@Component({
  selector: 'app-new-view',
  imports: [
    TranslocoPipe
  ],
  templateUrl: './new-view.component.html',
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class NewViewComponent {
  private readonly logger = LoggingService.logger;
  constructor() {
    this.logger.info('NewViewComponent login', ServiceProvider.get(AuthenticationService).login());
    ServiceProvider.get(RepositoryContextService).onRepositoryListChanged((repositoryList: RepositoryList | undefined) => {
      this.logger.info('NewViewComponent repositories', repositoryList?.getItems());
    });
  }
}
