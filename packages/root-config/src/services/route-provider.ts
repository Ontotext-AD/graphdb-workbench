import {BaseLayout, Route} from '../models/models';

export class RouteProvider {
  static getRoutesConfiguration(
    basePath: string,
    legacyRoutesDefinitions: Route[] = [],
    workbenchRoutesDefinition: Route[] = []
  ): BaseLayout {
    const baseLayout = this.getBaseLayout(basePath);
    const layoutConfiguration = this.getLayoutConfiguration();
    const mainConfiguration = this.getMainConfiguration();

    // Assemble the full route configuration
    baseLayout.routes.push(layoutConfiguration);
    layoutConfiguration.routes.push(mainConfiguration);
    mainConfiguration.routes.push(...legacyRoutesDefinitions, ...workbenchRoutesDefinition);

    return baseLayout;
  }

  static getBaseLayout(basePath: string = '/'): BaseLayout {
    return {
      // Makes the single spa router aware of reverse proxy context
      base: basePath,
      routes: [],
    };
  }

  static getLayoutConfiguration(): Route {
    return {
      type: 'onto-layout',
      routes: [],
    };
  }

  static getMainConfiguration(): Route {
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
