export class RouteProvider {
  static getRoutesConfiguration(basePath, legacyRoutesDefinitions = [], workbenchRoutesDefinition = []) {
    const baseLayout = this.getBaseLayout(basePath);
    const layoutConfiguration = this.getLayoutConfiguration();
    const mainConfiguration = this.getMainConfiguration();

    // Assemble the full route configuration
    baseLayout.routes.push(layoutConfiguration);
    layoutConfiguration.routes.push(mainConfiguration);
    mainConfiguration.routes.push(...legacyRoutesDefinitions, ...workbenchRoutesDefinition);

    return baseLayout;
  }

  static getBaseLayout(basePath = '/') {
    return {
      // Makes the single spa router aware of reverse proxy context
      base: basePath,
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
}
