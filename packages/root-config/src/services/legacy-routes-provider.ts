import {Route} from '../models/models';

declare const PluginRegistry: {
  // eslint-disable-next-line no-unused-vars
  get(key: string): Array<{ url: string; [key: string]: any }>;
};

export function getLegacyRoutes(): Route[] {
  const uniqueRoutes = new Map<string, Route>();

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
