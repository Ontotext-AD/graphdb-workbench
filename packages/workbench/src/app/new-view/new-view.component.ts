import {Component, CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {AuthenticationService, RepositoryContextService, ServiceProvider, RepositoryList} from '@ontotext/workbench-api';
import {TranslocoPipe} from '@jsverse/transloco';

@Component({
  selector: 'app-new-view',
  imports: [
    TranslocoPipe
  ],
  templateUrl: './new-view.component.html',
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class NewViewComponent {
  constructor() {
    console.info('NewViewComponent login', ServiceProvider.get(AuthenticationService).login());
    ServiceProvider.get(RepositoryContextService).onRepositoryListChanged((repositoryList: RepositoryList | undefined) => {
      console.info('NewViewComponent repositories', repositoryList?.getItems());
    });
  }
}
