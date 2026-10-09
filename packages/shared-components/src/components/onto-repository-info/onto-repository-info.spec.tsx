import {newSpecPage} from '@stencil/core/testing';
import {escapeHtml} from '../../utils/html-utils';

jest.mock('@ontotext/workbench-api', () => mockWorkbenchApi());

// The spec DOM does not implement the textarea value the sanitizer relies on, so only the sanitizer is replaced.
jest.mock('../../utils/html-utils', () => ({
  ...jest.requireActual('../../utils/html-utils'),
  sanitizeHTML: (html: string) => html,
}));

const mockLanguageListeners: ((language: string) => void)[] = [];

let OntoRepositoryInfo: typeof import('./onto-repository-info').OntoRepositoryInfo;
let TranslateLabel: typeof import('../translate-label/translate-label').TranslateLabel;

beforeAll(async () => {
  ({OntoRepositoryInfo} = await import('./onto-repository-info'));
  ({TranslateLabel} = await import('../translate-label/translate-label'));
});

const RUNNING_REPOSITORY = {
  id: 'starwars',
  title: 'Star Wars data',
  location: '',
  type: 'graphdb',
  state: 'RUNNING',
};
const INACTIVE_REPOSITORY = {...RUNNING_REPOSITORY, state: 'INACTIVE'};
const SIZE_INFO = {total: 4425, explicit: 3978, inferred: 447};

describe('onto-repository-info', () => {
  afterEach(() => {
    mockLanguageListeners.length = 0;
  });

  const renderPage = async (properties: Record<string, unknown>) => {
    const page = await newSpecPage({
      components: [OntoRepositoryInfo, TranslateLabel],
      html: '<onto-repository-info></onto-repository-info>',
    });
    Object.assign(page.root, properties);
    await page.waitForChanges();
    return page;
  };

  const render = async (properties: Record<string, unknown>) => (await renderPage(properties)).root;

  const renderFromAttributes = async (attributes: Record<string, string>) => {
    const html = Object.entries(attributes)
      .map(([name, value]) => `${name}="${escapeHtml(value)}"`)
      .join(' ');
    const page = await newSpecPage({
      components: [OntoRepositoryInfo, TranslateLabel],
      html: `<onto-repository-info ${html}></onto-repository-info>`,
    });
    await page.waitForChanges();
    return page.root;
  };

  const getText = (root: HTMLElement, name: string) =>
    root.querySelector(`[data-test="repository-info-${name}"]`)?.textContent.trim();

  const getElement = (root: HTMLElement, name: string) => root.querySelector(`[data-test="repository-info-${name}"]`);

  it('shows the information known for the repository', async () => {
    const root = await render({repository: RUNNING_REPOSITORY, permission: 'WRITE', sizeInfo: SIZE_INFO});

    expect(getText(root, 'title')).toBe('starwars');
    expect(getText(root, 'description')).toBe('Star Wars data');
    expect(getText(root, 'location')).toBe('Location:Local');
    expect(getText(root, 'type')).toBe('Type:Graphdb');
    expect(getText(root, 'permissions')).toBe('Permissions:Read/Write');
  });

  it('shows the location of a remote repository', async () => {
    const root = await render({
      repository: {...RUNNING_REPOSITORY, location: 'http://remote:7200'},
      permission: 'READ',
    });

    expect(getText(root, 'location')).toBe('Location:http://remote:7200');
  });

  it('shows a dash as permissions when no permission is passed', async () => {
    const root = await render({repository: RUNNING_REPOSITORY, sizeInfo: SIZE_INFO});

    expect(getText(root, 'permissions')).toBe('Permissions:-');
    expect(getText(root, 'type')).toBe('Type:Graphdb');
    expect(getText(root, 'total')).toBe('Total statements:4,425');
  });

  it('shows a spinner while the statement counts of a running repository are loading', async () => {
    const root = await render({repository: RUNNING_REPOSITORY, permission: 'READ', loading: true});

    expect(getElement(root, 'loading')).not.toBeNull();
    expect(getElement(root, 'total')).toBeNull();
    expect(getElement(root, 'not-available')).toBeNull();
    expect(getElement(root, 'inactive')).toBeNull();
  });

  it('shows the formatted statement counts of a running repository', async () => {
    const root = await render({repository: RUNNING_REPOSITORY, permission: 'READ', sizeInfo: SIZE_INFO});

    expect(getText(root, 'total')).toBe('Total statements:4,425');
    expect(getText(root, 'explicit')).toBe('Explicit:3,978');
    expect(getText(root, 'inferred')).toBe('Inferred:447');
    expect(getText(root, 'expansion-ratio')).toBe('Expansion ratio (total/explicit):1.11');
    expect(getElement(root, 'loading')).toBeNull();
  });

  it('formats the statement counts for the new language when the language changes', async () => {
    const page = await renderPage({repository: RUNNING_REPOSITORY, permission: 'READ', sizeInfo: SIZE_INFO});

    mockLanguageListeners.forEach((listener) => listener('fr'));
    await page.waitForChanges();

    expect(getText(page.root, 'total')).toBe('Total statements:4\u202f425');
    expect(getText(page.root, 'expansion-ratio')).toBe('Expansion ratio (total/explicit):1,11');
  });

  it('shows a dash as expansion ratio when there are no explicit statements', async () => {
    const root = await render({
      repository: RUNNING_REPOSITORY,
      permission: 'READ',
      sizeInfo: {total: 0, explicit: 0, inferred: 0},
    });

    expect(getText(root, 'expansion-ratio')).toBe('Expansion ratio (total/explicit):-');
  });

  it('shows that the statement counts are not available when a running repository has none', async () => {
    const root = await render({repository: RUNNING_REPOSITORY, permission: 'READ'});

    expect(getText(root, 'not-available')).toBe('Size info not available.');
    expect(getElement(root, 'total')).toBeNull();
    expect(getElement(root, 'loading')).toBeNull();
  });

  it('shows that the statement counts are not available when the total is negative', async () => {
    const root = await render({
      repository: RUNNING_REPOSITORY,
      permission: 'READ',
      sizeInfo: {total: -1, explicit: -1, inferred: -1},
    });

    expect(getText(root, 'not-available')).toBe('Size info not available.');
    expect(getElement(root, 'total')).toBeNull();
  });

  it('shows the activation message for a repository that is not running', async () => {
    const root = await render({
      repository: INACTIVE_REPOSITORY,
      permission: 'READ',
      loading: true,
      sizeInfo: SIZE_INFO,
    });

    expect(getText(root, 'inactive')).toBe('Activate the repository to view statement information');
    expect(getElement(root, 'total')).toBeNull();
    expect(getElement(root, 'loading')).toBeNull();
    expect(getElement(root, 'not-available')).toBeNull();
  });

  it('shows the same information when the repository and the statement counts are passed as JSON text', async () => {
    const repository = {...RUNNING_REPOSITORY, location: 'http://remote:7200'};
    const fromObjects = await render({repository, permission: 'MAINTAIN', sizeInfo: SIZE_INFO});
    const fromJsonText = await renderFromAttributes({
      'repository': JSON.stringify(repository),
      'permission': 'MAINTAIN',
      'size-info': JSON.stringify(SIZE_INFO),
    });

    expect(getText(fromJsonText, 'location')).toBe('Location:http://remote:7200');
    expect(getText(fromJsonText, 'permissions')).toBe('Permissions:Read/Write/Maintain');
    expect(getText(fromJsonText, 'total')).toBe('Total statements:4,425');
    ['title', 'description', 'location', 'type', 'permissions', 'total', 'explicit', 'inferred', 'expansion-ratio']
      .forEach((name) => expect(getText(fromJsonText, name)).toBe(getText(fromObjects, name)));
  });

  it('shows the spinner when the loading flag is passed as a text attribute', async () => {
    const root = await renderFromAttributes({
      'repository': JSON.stringify(RUNNING_REPOSITORY),
      'permission': 'READ',
      'loading': 'true',
    });

    expect(getElement(root, 'loading')).not.toBeNull();
  });

  it('shows HTML in the repository id and description as text', async () => {
    const description = '<b>bold</b><img src=x onerror="alert(1)">';
    const root = await render({
      repository: {...RUNNING_REPOSITORY, id: '<i>id</i>', title: description},
      permission: 'READ',
    });

    expect(getText(root, 'description')).toBe(description);
    expect(getElement(root, 'description').querySelector('b, img')).toBeNull();
    expect(getText(root, 'title')).toBe('<i>id</i>');
  });

  it('shows nothing when the repository is a text that is not a valid JSON', async () => {
    const root = await renderFromAttributes({repository: '{not a json', permission: 'READ'});

    expect(root.textContent.trim()).toBe('');
  });

  it('shows the statement counts as not available when they are a text that is not a valid JSON', async () => {
    const root = await renderFromAttributes({
      'repository': JSON.stringify(RUNNING_REPOSITORY),
      'permission': 'READ',
      'size-info': '{not a json',
    });

    expect(getText(root, 'title')).toBe('starwars');
    expect(getElement(root, 'not-available')).not.toBeNull();
  });

  it('shows nothing when no repository is passed', async () => {
    const root = await render({permission: 'READ'});

    expect(root.textContent.trim()).toBe('');
  });
});

/**
 * Builds the replacement of the workbench API for this spec. The spec resolves the API package to its type
 * declarations only, so everything the component uses at run time is provided here.
 */
function mockWorkbenchApi() {
  const languageContextService = {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    getDefaultBundle: () => require('../../assets/i18n/en.json'),
    onLanguageBundleChanged: () => jest.fn(),
    onSelectedLanguageChanged: (callback: (language: string) => void) => {
      mockLanguageListeners.push(callback);
      callback('en');
      return jest.fn();
    },
    getDefaultLanguage: () => 'en',
  };
  return {
    HtmlUtil: {sanitize: (html: string) => html},
    LanguageContextService: class {},
    LanguageService: class {},
    Loggers: {getLoggerInstance: () => ({error: jest.fn(), warn: jest.fn()})},
    RepositoryState: {
      INACTIVE: 'INACTIVE',
      STARTING: 'STARTING',
      RUNNING: 'RUNNING',
      RESTARTING: 'RESTARTING',
      STOPPING: 'STOPPING',
    },
    ServiceProvider: {get: () => languageContextService},
    service: () => languageContextService,
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
