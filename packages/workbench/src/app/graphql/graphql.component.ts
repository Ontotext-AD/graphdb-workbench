import {Component, CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {AuthenticationService, RepositoryContextService, ServiceProvider, RepositoryList} from "@ontotext/workbench-api";

@Component({
  selector: 'app-graphql',
  standalone: true,
  imports: [],
  templateUrl: './graphql.component.html',
  styleUrl: './graphql.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class GraphqlComponent {
  constructor() {
    console.log('GraphqlComponent login', ServiceProvider.get(AuthenticationService).login());
    ServiceProvider.get(RepositoryContextService).onRepositoriesChanged((repositoryList: RepositoryList | undefined) => {
      console.log('GraphqlComponent repositories', repositoryList?.repositories);
    });
  }
}
