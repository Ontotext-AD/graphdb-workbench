import {Component, CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {RepositoryContextService, ServiceProvider, RepositoryList} from "@ontotext/workbench-api";
import {TranslocoPipe} from '@jsverse/transloco';

@Component({
  selector: 'app-new-view',
  standalone: true,
  imports: [
    TranslocoPipe
  ],
  templateUrl: './new-view.component.html',
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class NewViewComponent {
  constructor() {
    ServiceProvider.get(RepositoryContextService).onRepositoryListChanged((repositoryList: RepositoryList | undefined) => {
      console.log('NewViewComponent repositories', repositoryList?.getItems());
    });
  }
}
