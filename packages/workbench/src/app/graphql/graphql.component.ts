import {Component, CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {WorkbenchAuthenticationService, WorkbenchRepositoryService, WorkbenchServiceProvider} from "@ontotext/workbench-api";

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
    console.log('GraphqlComponent login', WorkbenchServiceProvider.get(WorkbenchAuthenticationService).login());
    WorkbenchServiceProvider.get(WorkbenchRepositoryService).getRepositories().then((response) => {
      return response.json();
    }).then((data) => {
      console.log('GraphqlComponent repositories', data);
    });
  }
}
