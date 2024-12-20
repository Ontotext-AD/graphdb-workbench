import {Component, OnInit} from '@angular/core';
import {
  AuthenticationService,
  RepositoryContextService,
  ServiceProvider,
  RepositoryList
} from "@ontotext/workbench-api";
import * as singleSpa from 'single-spa';

@Component({
  selector: 'app-graphql-playground',
  standalone: true,
  imports: [],
  templateUrl: './graphql-playground.component.html',
  styleUrl: './graphql-playground.component.scss'
})
export class GraphqlPlaygroundComponent implements OnInit {
  constructor() {
    console.log('GraphqlComponent login', ServiceProvider.get(AuthenticationService).login());
    ServiceProvider.get(RepositoryContextService).onRepositoriesChanged((repositoryList: RepositoryList | undefined) => {
      console.log('GraphqlComponent repositories', repositoryList?.getItems());
    });
  }

  ngOnInit() {
    const link = document.querySelector('a');
    if (link) {
      link.addEventListener('click', (event: MouseEvent) => {
        event.preventDefault();
        const href = (event.currentTarget as HTMLAnchorElement).href;
        singleSpa.navigateToUrl(href); // Pass the href to single-spa
      });
    }
  }

  onButtonClick() {
    singleSpa.navigateToUrl('/import');
  }
}
