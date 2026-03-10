import {Routes} from '@angular/router';

export const routes: Routes = [
  {
    path: 'sparql-new',
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
