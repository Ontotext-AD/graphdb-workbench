export function getWorkbenchRoutes() {
  const routeDefinitions = [
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
