import {Component, CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {AuthenticationService, RepositoryService, ServiceProvider} from "@ontotext/workbench-api";

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
    ServiceProvider.get(RepositoryService).getRepositories().then((response) => {
      return response.json();
    }).then((data) => {
      console.log('GraphqlComponent repositories', data);
    });
  }
}
