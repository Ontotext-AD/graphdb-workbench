import {newSpecPage} from '@stencil/core/testing';

jest.mock('@ontotext/workbench-api', () => mockWorkbenchApi());

let OntoLayout: typeof import('./onto-layout').OntoLayout;

beforeAll(async () => {
  ({OntoLayout} = await import('./onto-layout'));
});

describe('onto-layout', () => {
  const render = async () => {
    const page = await newSpecPage({
      components: [OntoLayout],
      html: '<onto-layout><main slot="main" class="page-content"></main></onto-layout>',
    });
    await page.waitForChanges();
    return page.root as HTMLElement;
  };

  const landmarkOrder = (layout: HTMLElement) => Array.from(layout.children)
    .filter((child) => child.matches('.wb-header, nav, main, footer'))
    .map((child) => child.matches('.wb-header') ? 'header' : child.tagName.toLowerCase());

  it('should keep the main content after the header and navigation when the host re-inserts it as the first child', async () => {
    const layout = await render();
    const main = layout.querySelector('main');

    // The host application may do this with its <main> container on every routing event
    layout.insertBefore(main, layout.firstChild);

    expect(landmarkOrder(layout)).toEqual(['header', 'nav', 'main', 'footer']);
  });

  it('should still insert other nodes at the requested position', async () => {
    const layout = await render();
    const node = document.createElement('section');

    layout.insertBefore(node, layout.firstChild);

    expect(layout.firstChild).toBe(node);
  });
});

/**
 * Builds the replacement of the workbench API for this spec. The spec resolves the API package to its type
 * declarations only, so everything the layout uses at run time is provided here. Every service is a stand-in whose
 * methods return an unsubscribe function, which is enough for the layout to render its header, navigation and footer.
 *
 * @returns the stand-in for the `@ontotext/workbench-api` module.
 */
function mockWorkbenchApi() {
  const serviceStub = new Proxy({}, {get: () => () => jest.fn()});
  return {
    EventName: {},
    Loggers: {getLoggerInstance: () => ({error: jest.fn(), warn: jest.fn()})},
    MainMenuExtensionPoint: {NAME: 'main.menu'},
    StorageKey: {GLOBAL_NAMESPACE: 'graphdb'},
    WindowService: {
      getWindow: () => window,
      getPluginRegistry: () => ({get: (): unknown[] => []}),
    },
    ServiceProvider: {get: () => serviceStub},
    service: () => serviceStub,
    SubscriptionList: class {
      private readonly subscriptions: (() => void)[] = [];

      add(subscription: () => void) {
        this.subscriptions.push(subscription);
      }

      unsubscribeAll() {
        this.subscriptions.forEach((subscription) => subscription());
      }
    },
  };
}
