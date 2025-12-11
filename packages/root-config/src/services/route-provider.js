export class RouteProvider {
  static getRoutesConfiguration(basePath) {
    const baseLayout = this.getBaseLayout();
    // Makes the single spa router aware of reverse proxy context
    baseLayout.base = basePath;
    const layoutConfiguration = this.getLayoutConfiguration();
    const mainConfiguration = this.getMainConfiguration();
    const workbenchRoutes = this.getWorkbenchRoutes();
    const legacyRoutes = this.getLegacyRoutes();

    // Assemble the full route configuration
    baseLayout.routes.push(layoutConfiguration);
    layoutConfiguration.routes.push(mainConfiguration);
    mainConfiguration.routes.push(...legacyRoutes, ...workbenchRoutes);

    return baseLayout;
  }

  static getBaseLayout() {
    return {
      base: '/',
      routes: [],
    };
  }

  static getLayoutConfiguration() {
    return {
      type: 'onto-layout',
      routes: [],
    };
  }

  static getMainConfiguration() {
    return {
      type: 'main',
      attrs: [
        {
          name: 'slot',
          value: 'main',
        },
        {
          name: 'class',
          value: 'page-content',
        },
      ],
      routes: [],
    };
  }

  static getWorkbenchRoutes() {
    return [
      {
        type: 'route',
        path: 'login',
        routes: [{type: 'application', name: '@ontotext/workbench'}],
        default: false,
      },
      {
        type: 'route',
        path: 'new-view',
        routes: [{type: 'application', name: '@ontotext/workbench'}],
        default: false,
      },
      {
        type: 'route',
        path: 'sparql-new',
        routes: [{type: 'application', name: '@ontotext/workbench'}],
        default: false,
      },
      {
        type: 'route',
        routes: [{type: 'application', name: '@ontotext/workbench'}],
        default: true,
      }];
  }

  static getLegacyRoutes() {
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
}
