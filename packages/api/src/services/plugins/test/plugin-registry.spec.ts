import {PluginRegistry} from '../plugin-registry';
import {WindowService} from '../../window';
import {service, ServiceProvider} from '../../../providers';
import {PluginsService} from '../plugins.service';
import {
  MainMenuPlugin,
  PluginModule,
  PluginsManifestResponse,
  Plugin,
  GuidePlugin, ThemesExtensionPoint,
  InteractiveGuideExtensionPoint,
  MainMenuExtensionPoint
} from '../../../models/plugins';
import {PluginsRestService} from '../plugins-rest.service';
import {ConfigurationContextService} from '../../configuration/configuration-context.service';
import {LoggerType} from '../../../models/logging/logger-type';
import {LogLevel} from '../../../models/logging/log-level';
import {TestUtil} from '../../utils/test/test-util';
import {ResponseMock} from '../../http/test/response-mock';
import {ExtensionPointAlreadyRegisteredError} from '../extension-point-already-registered-error';
import {OrderedExtensionPoint} from '../../../models/plugins/extension-points/ordered/ordered-extension-point';
import {DuplicatePluginOrderError} from '../duplicate-plugin-order-error';
import {Configuration} from '../../../models/configuration';

describe('PluginRegistry', () => {
  beforeEach(() => {
    initializeTest();
  });

  it('registerExtensionPoint should register extension point', () => {
    // WHEN: I register a new extension point
    const pluginRegistry = WindowService.getPluginRegistry();
    const themesExtensionPoint = new ThemesExtensionPoint();
    pluginRegistry.registerExtensionPoint(themesExtensionPoint);

    // THEN: I expect the extension point to be registered
    expect(ThemesExtensionPoint.NAME).toBeDefined();
  });

  it('registerExtensionPoint should throw exception when try to register an extension point twice', () => {
    // WHEN: I register an extension point twice
    const pluginRegistry = WindowService.getPluginRegistry();
    const mainMenuExtensionPoint = new MainMenuExtensionPoint();

    // THEN: I expect the exception to be thrown.
    expect(() => pluginRegistry.registerExtensionPoint(mainMenuExtensionPoint))
      .toThrow(ExtensionPointAlreadyRegisteredError);

  });

  it('add should not registers undefined plugins to the extension point', async () => {
    // When: I load a plugin definition with undefined plugin
    mockLoadPluginsResponse([getPluginModule(MainMenuExtensionPoint.NAME, undefined)]);
    await service(PluginsService).loadPlugins();
    const pluginRegistry = WindowService.getPluginRegistry();

    // Then: I expect the plugin haven't been registered into main menu extension point.
    const mainMenuPlugins = pluginRegistry.get(MainMenuExtensionPoint.NAME);
    expect(mainMenuPlugins.length).toBe(0);
  });

  it('add should registers a plugin to extension point', async () => {
    // When: I load a plugin definition
    const mainMenuPlugin = getAutocompleteMainMenuPlugin();
    mockLoadPluginsResponse([getPluginModule(MainMenuExtensionPoint.NAME, mainMenuPlugin)]);
    await service(PluginsService).loadPlugins();
    const pluginRegistry = WindowService.getPluginRegistry();

    // Then: I expect the plugin be registered into main menu extension point.
    const mainMenuPlugins = pluginRegistry.get(MainMenuExtensionPoint.NAME);
    expect(mainMenuPlugins.length).toBe(1);
    expect(mainMenuPlugins[0]).toEqual(mainMenuPlugin);
  });

  it('add should registers plugins to extension point', async () => {
    // When: I load many plugin definitions at same time
    const autocompleteMainMenuPlugin = getAutocompleteMainMenuPlugin();
    const similarityMainMenuPlugin = getSimilarityMainMenuPlugin();
    mockLoadPluginsResponse([getPluginModule(MainMenuExtensionPoint.NAME, [autocompleteMainMenuPlugin, similarityMainMenuPlugin])]);
    await service(PluginsService).loadPlugins();
    const pluginRegistry = WindowService.getPluginRegistry();

    // Then: I expect the plugins have been registered into main menu extension point.
    const mainMenuPlugins = pluginRegistry.get(MainMenuExtensionPoint.NAME);
    expect(mainMenuPlugins.length).toBe(2);
    expect(mainMenuPlugins[0]).toEqual(autocompleteMainMenuPlugin);
    expect(mainMenuPlugins[1]).toEqual(similarityMainMenuPlugin);
  });

  it('add should not registers disabled plugins to the extension point', async () => {
    // When: I load many plugin definitions at same time
    const autocompleteMainMenuPlugin = getAutocompleteMainMenuPlugin();
    // AND: some of them are disabled
    const similarityMainMenuPlugin = getSimilarityMainMenuPlugin(true);
    mockLoadPluginsResponse([getPluginModule(MainMenuExtensionPoint.NAME, [autocompleteMainMenuPlugin, similarityMainMenuPlugin])]);
    await service(PluginsService).loadPlugins();
    const pluginRegistry = WindowService.getPluginRegistry();

    // Then: I expect only one plugin have been registered into main menu extension point.
    const mainMenuPlugins = pluginRegistry.get(MainMenuExtensionPoint.NAME);
    expect(mainMenuPlugins.length).toBe(1);
    expect(mainMenuPlugins[0]).toEqual(autocompleteMainMenuPlugin);
  });

  it('add should unregister the old and register the new plugin if they have same unique id field', async () => {
    // GIVEN: I load many plugin definitions
    const interactiveGuideStep = getInteractiveGuideStep('overridable_unique_name', 'interactiveGuideStep');
    const uniqueInteractiveGuideStep = getInteractiveGuideStep('unique_name', 'uniqueInteractiveGuideStep');
    // AND: a step has same unique id field value "overridable_unique_name"
    const overridableInteractiveGuideStep = getInteractiveGuideStep('overridable_unique_name', 'overridableInteractiveGuideStep');
    mockLoadPluginsResponse([getPluginModule(InteractiveGuideExtensionPoint.NAME, [interactiveGuideStep, uniqueInteractiveGuideStep, overridableInteractiveGuideStep])]);
    await service(PluginsService).loadPlugins();

    // THEN: I expect the first step not be registered the second step with same unique name to be registered.
    const pluginRegistry = WindowService.getPluginRegistry();

    const plugins = pluginRegistry.get(InteractiveGuideExtensionPoint.NAME);

    expect(plugins.length).toBe(2);
    expect(plugins[0]).toEqual(uniqueInteractiveGuideStep);
    expect(plugins[1]).toEqual(overridableInteractiveGuideStep);
  });

  it('add should register ordered plugins to extension point in ordered way', async () => {
    // GIVEN: I have registered ordered extension point
    const pluginRegistry = WindowService.getPluginRegistry();
    pluginRegistry.registerExtensionPoint(new TestOrderedExtensionPoint());

    // WHEN: I load many ordered plugin definitions at same time
    const firstOrderedPlugin = getTestOrderedPlugin(2, 0);
    const secondOrderedPlugin = getTestOrderedPlugin(1, 0);
    mockLoadPluginsResponse([getPluginModule(TestOrderedExtensionPoint.NAME, [firstOrderedPlugin, secondOrderedPlugin])]);
    await service(PluginsService).loadPlugins();

    // THEN: I expect the plugins have been registered into the ordered extension point in the correct order.
    const orderedPlugins = pluginRegistry.get(TestOrderedExtensionPoint.NAME);
    expect(orderedPlugins.length).toBe(2);
    expect(orderedPlugins[0]).toEqual(secondOrderedPlugin);
    expect(orderedPlugins[1]).toEqual(firstOrderedPlugin);
  });

  it('add should register ordered plugins and keep the one with higher priority', async () => {
    // GIVEN: I have registered ordered extension point
    const pluginRegistry = WindowService.getPluginRegistry();
    pluginRegistry.registerExtensionPoint(new TestOrderedExtensionPoint());

    // WHEN: I load many ordered plugin definitions at same time
    const firstOrderedPlugin = getTestOrderedPlugin(2, 0);
    const secondOrderedPlugin = getTestOrderedPlugin(1, 0);
    const thirdOrderedPlugin = getTestOrderedPlugin(2, 2);
    const fourthOrderedPlugin = getTestOrderedPlugin(2, 1);
    mockLoadPluginsResponse([getPluginModule(TestOrderedExtensionPoint.NAME, [firstOrderedPlugin, secondOrderedPlugin, thirdOrderedPlugin, fourthOrderedPlugin])]);
    await service(PluginsService).loadPlugins();

    // THEN: I expect the plugins have been registered into the ordered extension point in the correct order.
    const orderedPlugins = pluginRegistry.get(TestOrderedExtensionPoint.NAME);
    expect(orderedPlugins.length).toBe(2);
    expect(orderedPlugins[0]).toEqual(secondOrderedPlugin);
    expect(orderedPlugins[1]).toEqual(thirdOrderedPlugin);
  });

  it('add should throw error if try to register plugins with same order and priority', async () => {
    // GIVEN: I have registered ordered extension point and loaded a plugin
    const pluginRegistry = WindowService.getPluginRegistry();
    pluginRegistry.registerExtensionPoint(new TestOrderedExtensionPoint());
    const firstOrderedPlugin = getTestOrderedPlugin(2, 2);
    mockLoadPluginsResponse([getPluginModule(TestOrderedExtensionPoint.NAME, [firstOrderedPlugin])]);
    await service(PluginsService).loadPlugins();

    // WHEN: I try to add another plugin with same order and priority
    // THEN: I expect an error to be thrown
    const secondOrderedPlugin = getTestOrderedPlugin(2, 2);
    expect(() => pluginRegistry.add(TestOrderedExtensionPoint.NAME, secondOrderedPlugin)).toThrow(DuplicatePluginOrderError);
  });

  it('get should throws an error if try to get unavailable extension point', () => {
    // WHEN: try to get some unavailable extension point.
    // THEN: I expect and error to be thrown.
    expect(() => WindowService.getPluginRegistry().get('unavailableExtensionPoint')).toThrow();
  });

  it('findPlugin should returns plugin', async () => {
    // GIVEN: I load many plugin definitions
    const autocompleteMainMenuPlugin = getAutocompleteMainMenuPlugin();
    const similarityMainMenuPlugin = getSimilarityMainMenuPlugin();
    mockLoadPluginsResponse([getPluginModule(MainMenuExtensionPoint.NAME, [autocompleteMainMenuPlugin, similarityMainMenuPlugin])]);
    await service(PluginsService).loadPlugins();
    const pluginRegistry = WindowService.getPluginRegistry();

    // WHEN: looking for the specific plugin
    const foundPlugin = pluginRegistry.findPlugin<MainMenuPlugin>(MainMenuExtensionPoint.NAME, (plugin) => plugin.items[1].label === 'Autocomplete');

    // THEN: I expect the looked for plugin to be found.
    expect(foundPlugin).toEqual(autocompleteMainMenuPlugin);
  });

  it('getExtensionPoints should returns all extension points', async () => {
    // GIVEN: I load many plugin definitions
    const autocompleteMainMenuPlugin = getAutocompleteMainMenuPlugin();
    const similarityMainMenuPlugin = getSimilarityMainMenuPlugin();
    const guideStep = getInteractiveGuideStep('guideBlock', 'guideStep');
    mockLoadPluginsResponse([getPluginModule(MainMenuExtensionPoint.NAME, [autocompleteMainMenuPlugin, similarityMainMenuPlugin]),
      getPluginModule(InteractiveGuideExtensionPoint.NAME, [guideStep])]);
    await service(PluginsService).loadPlugins();
    const pluginRegistry = WindowService.getPluginRegistry();

    // WHEN: I get all extension points
    const extensionPoints = pluginRegistry.getExtensionPoints();

    // THEN: I expect all extension points to be returned.
    expect(Object.keys(extensionPoints).length).toBe(2);
    expect(extensionPoints[MainMenuExtensionPoint.NAME]).toBeDefined();
    expect(extensionPoints[InteractiveGuideExtensionPoint.NAME]).toBeDefined();

  });

  it('clearAll shold clear all extension points', async () => {
    // GIVEN: I load many plugin definitions
    const autocompleteMainMenuPlugin = getAutocompleteMainMenuPlugin();
    const similarityMainMenuPlugin = getSimilarityMainMenuPlugin();
    const guideStep = getInteractiveGuideStep('guideBlock', 'guideStep');
    mockLoadPluginsResponse([getPluginModule(MainMenuExtensionPoint.NAME, [autocompleteMainMenuPlugin, similarityMainMenuPlugin]),
      getPluginModule(InteractiveGuideExtensionPoint.NAME, [guideStep])]);
    await service(PluginsService).loadPlugins();
    const pluginRegistry = WindowService.getPluginRegistry();

    // WHEN: I clear all extension points
    pluginRegistry.clear(MainMenuExtensionPoint.NAME);

    // THEN: I expect only the main menu extension points to be cleared.
    expect(pluginRegistry.get(MainMenuExtensionPoint.NAME).length).toBe(0);
    expect(pluginRegistry.get(InteractiveGuideExtensionPoint.NAME).length).toBe(1);
  });

  it('clearAll shold clear all extension points', async () => {
    // GIVEN: I load many plugin definitions
    const autocompleteMainMenuPlugin = getAutocompleteMainMenuPlugin();
    const similarityMainMenuPlugin = getSimilarityMainMenuPlugin();
    const guideStep = getInteractiveGuideStep('guideBlock', 'guideStep');
    mockLoadPluginsResponse([getPluginModule(MainMenuExtensionPoint.NAME, [autocompleteMainMenuPlugin, similarityMainMenuPlugin]),
      getPluginModule(InteractiveGuideExtensionPoint.NAME, [guideStep])]);
    await service(PluginsService).loadPlugins();
    const pluginRegistry = WindowService.getPluginRegistry();

    // WHEN: I clear all extension points
    pluginRegistry.clearAll();

    // THEN: I expect all extension points to be cleared.
    expect(pluginRegistry.get(MainMenuExtensionPoint.NAME).length).toBe(0);
    expect(pluginRegistry.get(InteractiveGuideExtensionPoint.NAME).length).toBe(0);
  });
});

const initializeTest = () => {
  // Spy on getPluginRegistry and mock its return value
  const extensionPoints = {
    [MainMenuExtensionPoint.NAME]: new MainMenuExtensionPoint(),
    [InteractiveGuideExtensionPoint.NAME]: new InteractiveGuideExtensionPoint()
  };
  const pluginRegistry = new PluginRegistry(extensionPoints);
  jest.spyOn(WindowService, 'getPluginRegistry').mockReturnValue(pluginRegistry);
  ServiceProvider.get(ConfigurationContextService).updateApplicationConfiguration({
    pluginsManifestPath: 'plugins/plugins-manifest.json',
    loggerConfig: {
      loggers: [LoggerType.CONSOLE],
      minLogLevel: LogLevel.DEBUG
    }
  } as unknown as Configuration);
  const manifest: PluginsManifestResponse = {
    plugins: [{
      name: 'test-plugin',
      entry: 'test-plugin.js'
    }]
  };
  TestUtil.mockResponse(new ResponseMock('plugins/plugins-manifest.json').setResponse(manifest));
};

const mockLoadPluginsResponse = (loadPluginResponses: PluginModule[]) => {
  jest
    .spyOn(PluginsRestService.prototype, 'loadPlugins')
    .mockImplementation(async () => {
      return loadPluginResponses;
    });
};

const getAutocompleteMainMenuPlugin = () => {
  return {
    items:
      [
        {
          label: 'Setup',
          href: '#',
          order: 5,
          role: 'IS_AUTHENTICATED_FULLY',
          icon: 'icon-settings'
        },
        {
          label: 'Autocomplete',
          href: 'autocomplete',
          order: 40,
          parent: 'Setup',
          role: 'IS_AUTHENTICATED_FULLY'
        },
      ]
  } as MainMenuPlugin;
};

const getSimilarityMainMenuPlugin = (disabled = false) => {
  return {
    disabled,
    items: [
      {label: 'Similarity', href: 'autocomplete', order: 41, parent: 'Setup', role: 'ROLE_USER'},
    ]
  } as MainMenuPlugin;
};

const getPluginModule = <T extends Plugin>(extensionPointName: string, plugin: T | T[] | undefined) => {
  return {
    register(pluginRegistry: PluginRegistry) {
      pluginRegistry.add(extensionPointName, plugin);
    },
  } as PluginModule;
};

const getInteractiveGuideStep = (guideBlockName: string, innerGuideStep: string) => {
  return {
    guideBlockName,
    getSteps: function () {
      return {
        guideBlockName: innerGuideStep
      };
    }
  } as unknown as GuidePlugin;
};

const getTestOrderedPlugin = (order: number, priority: number) => {
  return {
    order,
    priority
  } as unknown as Plugin;
};

class TestOrderedExtensionPoint extends OrderedExtensionPoint {
  static readonly NAME = 'TestOrderedExtensionPoint';
  name = TestOrderedExtensionPoint.NAME;
}
