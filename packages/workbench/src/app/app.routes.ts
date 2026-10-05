import {WorkbenchRoute} from './models/route/workbench-route';
import {documentationLinkResolve} from './services/route-data-resolver';
import {ViewRestrictionCondition} from '@ontotext/workbench-api';

export const routes: WorkbenchRoute[] = [
  {
    path: 'sparql-new',
    data: {
      title: 'sparql_editor.title',
      helpInfo: 'sparql_editor.helpInfo',
      documentationUrl: 'sparql-queries.html',
      viewRestrictions: [ViewRestrictionCondition.IS_REPOSITORY_NOT_SELECTED],
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
    path: 'graph-navigator',
    data: {
      title: 'graph_navigator.title',
      helpInfo: 'graph_navigator.helpInfo',
      viewRestrictions: [
        ViewRestrictionCondition.IS_REPOSITORY_NOT_SELECTED,
        ViewRestrictionCondition.IS_LICENSE_INVALID,
      ],
    },
    loadComponent: () => import('./pages/graph-navigator/graph-navigator-page.component').then(m => m.GraphNavigatorPageComponent)
  },
  {
    path: '**',
    loadComponent: () => import('./pages/not-found/not-found-page.component').then(m => m.NotFoundPageComponent)
  }
];
