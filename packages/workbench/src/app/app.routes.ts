import {Routes} from '@angular/router';
import {documentationLinkResolve} from './services/route-data-resolver';

export const routes: Routes = [
  {
    path: 'sparql',
    data: {
      title: 'sparql_editor.title',
      helpInfo: 'sparql_editor.helpInfo',
      documentationUrl: 'sparql-queries.html'
    },
    resolve: {documentationLink: documentationLinkResolve},
    loadComponent: () => import('./pages/sparql-editor/sparql-editor-page.component').then(m => m.SparqlEditorPageComponent)
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login-page.component').then(m => m.LoginPageComponent)
  },
  {
    path: 'ux-test',
    loadComponent: () => import('./pages/ux-test/ux-test-page.component').then(m => m.UxTestPageComponent)
  },
  {
    path: '**',
    loadComponent: () => import('./pages/not-found/not-found-page.component').then(m => m.NotFoundPageComponent)
  }
];
