export function getLegacyRoutes() {
  const uniqueRoutes = new Map();

  PluginRegistry.get('route').forEach((route) => {
    const slashIndex = route.url.indexOf('/', 1);
    const normalizedUrl = slashIndex === -1 ? route.url : route.url.substring(0, slashIndex);

    if (!uniqueRoutes.has(normalizedUrl)) {
      uniqueRoutes.set(normalizedUrl, {
        type: 'route',
        path: normalizedUrl,
        exact: normalizedUrl === '/',
        routes: [{type: 'application', name: '@ontotext/legacy-workbench'}],
        default: false,
      });
    }
  });

  return Array.from(uniqueRoutes.values());
}
