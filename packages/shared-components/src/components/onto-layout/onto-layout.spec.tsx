import {newSpecPage} from '@stencil/core/testing';

jest.mock('@ontotext/workbench-api', () => mockWorkbenchApi());

const mockGetApplicationsState = jest.fn();

let OntoLayout: typeof import('./onto-layout').OntoLayout;
let mockWindow: {
  storageListeners: ((event: Partial<StorageEvent>) => void)[],
  addEventListener: (type: string, listener: (event: Partial<StorageEvent>) => void) => void,
  innerWidth: number,
  location: {reload: jest.Mock},
};
let mockAuthenticated = false;
let mockLoginOrLogout = true;

beforeAll(async () => {
  ({OntoLayout} = await import('./onto-layout'));
});

beforeEach(() => {
  mockAuthenticated = false;
  mockLoginOrLogout = true;
  mockWindow = {
    storageListeners: [],
    addEventListener(type, listener) {
      if (type === 'storage') {
        this.storageListeners.push(listener);
      }
    },
    innerWidth: 1280,
    location: {reload: jest.fn()},
  };
});

describe('onto-layout', () => {
  beforeEach(() => {
    mockGetApplicationsState.mockReset();
  });

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

  it('should show the main content if the application mounted before the layout connected', async () => {
    // Given, single-spa has already mounted the first application
    mockGetApplicationsState.mockReturnValue({});

    // When, the layout loads
    const layout = await render();

    // Then, it should not show the loader
    expect(layout.classList.contains('loading')).toBe(false);
  });

  it('should show the loader while the initial application is mounting', async () => {
    // Given, single-spa has not mounted an application yet
    mockGetApplicationsState.mockReturnValue(undefined);

    // When, the layout loads
    const layout = await render();

    // Then, it should show the loader until the navigation ends
    expect(layout.classList.contains('loading')).toBe(true);
  });

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

  describe('a login or logout in another tab', () => {
    const changeStorage = (key: string, oldValue: string | null, newValue: string | null) => {
      mockWindow.storageListeners.forEach((listener) => listener({key: `graphdb.auth.${key}`, oldValue, newValue}));
    };

    it('should reload the page once when both auth keys change', async () => {
      await render();
      mockAuthenticated = true;

      changeStorage('authenticated', 'false', 'true');
      changeStorage('jwt', null, 'GDB token');

      expect(mockWindow.location.reload).toHaveBeenCalledTimes(1);
    });

    it('should reload the page again when the next change is the opposite state', async () => {
      await render();
      mockAuthenticated = false;
      changeStorage('authenticated', 'true', 'false');

      mockAuthenticated = true;
      changeStorage('authenticated', 'false', 'true');

      expect(mockWindow.location.reload).toHaveBeenCalledTimes(2);
    });

    it('should not reload the page for a storage change that is not a login or logout', async () => {
      await render();
      mockAuthenticated = true;
      mockLoginOrLogout = false;

      changeStorage('jwt', 'Bearer old', 'Bearer new');

      expect(mockWindow.location.reload).not.toHaveBeenCalled();
    });
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
  const serviceStub = new Proxy({}, {get: (_, property) => property === 'getApplicationsState' ? mockGetApplicationsState : () => jest.fn()});
  class AuthenticationStorageService {}
  const authStorageStub = {
    isAuthenticated: () => mockAuthenticated,
    isLoginOrLogout: () => mockLoginOrLogout,
  };
  return {
    AuthenticationStorageService,
    EventName: {},
    Loggers: {getLoggerInstance: () => ({error: jest.fn(), warn: jest.fn()})},
    MainMenuExtensionPoint: {NAME: 'main.menu'},
    StorageKey: {GLOBAL_NAMESPACE: 'graphdb'},
    WindowService: {
      getWindow: () => mockWindow,
      getPluginRegistry: () => ({get: (): unknown[] => []}),
    },
    ServiceProvider: {get: () => serviceStub},
    service: (type: unknown) => type === AuthenticationStorageService ? authStorageStub : serviceStub,
    navigate: jest.fn(),
    navigateToLoginPage: jest.fn(),
    isLoginPage: () => false,
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
