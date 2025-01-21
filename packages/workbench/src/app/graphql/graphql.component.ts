import {Component, CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {AuthenticationService, RepositoryContextService, ServiceProvider, RepositoryList} from "@ontotext/workbench-api";
import {TranslocoPipe} from '@jsverse/transloco';

@Component({
  selector: 'app-graphql',
  standalone: true,
  imports: [
    TranslocoPipe
  ],
  templateUrl: './graphql.component.html',
  styleUrl: './graphql.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class GraphqlComponent {
  constructor() {
    console.log('GraphqlComponent login', ServiceProvider.get(AuthenticationService).login());
    ServiceProvider.get(RepositoryContextService).onRepositoryListChanged((repositoryList: RepositoryList | undefined) => {
      console.log('GraphqlComponent repositories', repositoryList?.getItems());
    });
  }
}
