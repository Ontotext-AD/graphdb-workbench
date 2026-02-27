import {Route, RouteDefinition} from '../models/models';

export function getWorkbenchRoutes(): Route[] {
  const routeDefinitions: RouteDefinition[] = [
    {
      path: 'login',
      default: false,
    },
    {
      path: 'new-view',
      default: false,
    },
    {
      path: 'sparql-new',
      default: false,
    },
    {
      default: true,
    },
  ];

  return routeDefinitions.map((r) => ({
    type: 'route',
    ...(r.path && { path: r.path }),
    routes: [{type: 'application', name: '@ontotext/workbench'}],
    default: r.default,
  }));
}
