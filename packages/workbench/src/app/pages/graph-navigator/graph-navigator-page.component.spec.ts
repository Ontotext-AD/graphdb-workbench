import {ComponentFixture, TestBed} from '@angular/core/testing';
import {NO_ERRORS_SCHEMA} from '@angular/core';
import {GraphNavigatorPageComponent} from './graph-navigator-page.component';
import {provideTranslocoForTesting} from '../../../testing-utils/transloco-utils';
import {mockResizeObserverForTesting} from '../../../testing-utils/resize-observer-testing-utils';
import {
  AuthorizationService,
  GraphExploreLink,
  GraphExploreService,
  GraphNavigatorService,
  GraphNavigatorSettings,
  LanguageContextService,
  OntoToastrService,
  Repository,
  RepositoryContextService,
  RepositoryList,
  ServiceProvider,
  SparqlDataProviderSettings
} from '@ontotext/workbench-api';
import {ActivatedRoute} from '@angular/router';
import {By} from '@angular/platform-browser';
import {ConfirmationService} from 'primeng/api';
import {
  GraphwiseReactodiaFacadeComponent
} from '../../components/graphwise-reactodia-facade/graphwise-reactodia-facade.component';

jest.mock('graphwise-reactodia/loader', () => ({
  defineCustomElements: jest.fn()
}));

describe('GraphNavigatorPageComponent', () => {
  mockResizeObserverForTesting();

  const QUERY = 'CONSTRUCT WHERE { ?s ?p ?o }';
  let component: GraphNavigatorPageComponent;
  let fixture: ComponentFixture<GraphNavigatorPageComponent>;
  let loadGraphForQuerySpy: jest.SpyInstance;
  let getSettingsSpy: jest.SpyInstance;
  let canMaintainRepoSpy: jest.SpyInstance;
  let repositoryContextService: RepositoryContextService;
  const REPOSITORY_A = new Repository({id: 'repo-a', location: '', uri: 'http://repo-a'});
  const REPOSITORY_B = new Repository({id: 'repo-b', location: '', uri: 'http://repo-b'});
  const createProviderSettings = (dataLabelProperty: string): SparqlDataProviderSettings => ({
    defaultPrefix: '',
    schemaLabelProperty: 'rdfs:label',
    dataLabelProperty,
    elementInfoQuery: '',
    linksInfoQuery: '',
    imageQueryPattern: '',
    linkTypesOfQuery: '',
    linkTypesStatisticsQuery: '',
    lookupQuery: '',
    filterRefElementLinkPattern: '',
    filterTypePattern: '',
    filterElementInfoPattern: '',
    filterAdditionalRestriction: '',
    fullTextSearch: {prefix: '', queryPattern: ''},
    linkConfigurations: [],
    propertyConfigurations: []
  });
  const SETTINGS_A = new GraphNavigatorSettings({uploaded: false, providerSettings: createProviderSettings('rdfs:label')});
  const SETTINGS_B = new GraphNavigatorSettings({uploaded: true, providerSettings: createProviderSettings('skos:prefLabel')});
  const activatedRouteStub = {snapshot: {queryParams: {} as Record<string, string>, data: {}}};

  beforeEach(async () => {
    activatedRouteStub.snapshot.queryParams = {};

    jest.spyOn(ServiceProvider.get(LanguageContextService), 'getSelectedLanguage')
      .mockReturnValue('en');
    jest.spyOn(ServiceProvider.get(LanguageContextService), 'onSelectedLanguageChanged')
      .mockImplementation(() => () => {
        // No-op subscription that doesn't call the callback immediately.
      });
    loadGraphForQuerySpy = jest.spyOn(ServiceProvider.get(GraphExploreService), 'loadGraphForQuery')
      .mockResolvedValue([]);
    getSettingsSpy = jest.spyOn(ServiceProvider.get(GraphNavigatorService), 'getSettings')
      .mockResolvedValue(SETTINGS_A);
    canMaintainRepoSpy = jest.spyOn(ServiceProvider.get(AuthorizationService), 'canMaintainRepo')
      .mockReturnValue(true);
    repositoryContextService = ServiceProvider.get(RepositoryContextService);
    repositoryContextService.updateRepositoryList(new RepositoryList([REPOSITORY_A, REPOSITORY_B]));

    await TestBed.configureTestingModule({
      imports: [
        GraphNavigatorPageComponent,
        provideTranslocoForTesting()
      ],
      providers: [
        {provide: ActivatedRoute, useValue: activatedRouteStub},
        ConfirmationService
      ],
      schemas: [NO_ERRORS_SCHEMA]
    })
      .compileComponents();

    fixture = TestBed.createComponent(GraphNavigatorPageComponent);
    component = fixture.componentInstance;
  });

  afterEach(async () => {
    await repositoryContextService.updateSelectedRepository(undefined);
    repositoryContextService.updateRepositoryList(undefined as unknown as RepositoryList);
    jest.restoreAllMocks();
  });

  const selectRepository = async (repository: Repository) => {
    await repositoryContextService.updateSelectedRepository(repository);
    fixture.detectChanges();
  };

  const settle = async () => {
    await fixture.whenStable();
    fixture.detectChanges();
  };

  const getFacade = () => fixture.debugElement.query(By.directive(GraphwiseReactodiaFacadeComponent));

  const deferred = <T>() => {
    let resolve!: (value: T) => void;
    let reject!: (reason: unknown) => void;
    const promise = new Promise<T>((res, rej) => {
      resolve = res;
      reject = rej;
    });
    return {promise, resolve, reject};
  };

  describe('graph-navigator settings', () => {
    it('should wait for the settings before rendering the diagram', async () => {
      // GIVEN: the settings are still loading.
      const settingsRequest = deferred<GraphNavigatorSettings>();
      getSettingsSpy.mockReturnValue(settingsRequest.promise);

      // WHEN: a repository is selected.
      fixture.detectChanges();
      await selectRepository(REPOSITORY_A);

      // THEN: the diagram is not rendered until the settings arrive.
      expect(getSettingsSpy).toHaveBeenCalledWith(REPOSITORY_A.id);
      expect(getFacade()).toBeNull();

      settingsRequest.resolve(SETTINGS_A);
      await settle();

      // AND: then it is rendered with them.
      const facade = getFacade().componentInstance as GraphwiseReactodiaFacadeComponent;
      expect(facade.currentRepository()).toBe(REPOSITORY_A.id);
      expect(facade.providerSettings()).toEqual(SETTINGS_A.getProviderSettings());
    });

    it('should reload the settings and mount the diagram once with the new repository when the repository changes', async () => {
      // GIVEN: the diagram is rendered for the first repository.
      fixture.detectChanges();
      await selectRepository(REPOSITORY_A);
      await settle();
      expect(getFacade()).not.toBeNull();

      // WHEN: the repository changes while its settings are loading.
      const settingsRequest = deferred<GraphNavigatorSettings>();
      getSettingsSpy.mockReturnValue(settingsRequest.promise);
      await selectRepository(REPOSITORY_B);

      // THEN: the diagram is removed instead of being shown with the old settings.
      expect(getSettingsSpy).toHaveBeenLastCalledWith(REPOSITORY_B.id);
      expect(getFacade()).toBeNull();

      // AND: it is mounted with the new repository and its settings together.
      settingsRequest.resolve(SETTINGS_B);
      await settle();
      const facade = getFacade().componentInstance as GraphwiseReactodiaFacadeComponent;
      expect(facade.currentRepository()).toBe(REPOSITORY_B.id);
      expect(facade.providerSettings()).toEqual(SETTINGS_B.getProviderSettings());
    });

    it('should ignore settings that arrive for a repository that is no longer selected', async () => {
      // GIVEN: the settings of the first repository are slow.
      const slowRequest = deferred<GraphNavigatorSettings>();
      getSettingsSpy.mockReturnValueOnce(slowRequest.promise).mockResolvedValueOnce(SETTINGS_B);
      fixture.detectChanges();
      await selectRepository(REPOSITORY_A);

      // WHEN: another repository is selected and the first request resolves afterwards.
      await selectRepository(REPOSITORY_B);
      await settle();
      slowRequest.resolve(SETTINGS_A);
      await settle();

      // THEN: the diagram keeps the settings of the selected repository.
      const facade = getFacade().componentInstance as GraphwiseReactodiaFacadeComponent;
      expect(facade.currentRepository()).toBe(REPOSITORY_B.id);
      expect(facade.providerSettings()).toEqual(SETTINGS_B.getProviderSettings());
    });

    it('should not render the diagram and should notify when the settings cannot be loaded', async () => {
      // GIVEN: loading the settings fails.
      const toastrErrorSpy = jest.spyOn(ServiceProvider.get(OntoToastrService), 'error');
      getSettingsSpy.mockRejectedValue(new Error('Server error'));

      // WHEN: a repository is selected.
      fixture.detectChanges();
      await selectRepository(REPOSITORY_A);
      await settle();

      // THEN: the diagram is not rendered and the failure is reported.
      expect(getFacade()).toBeNull();
      expect(toastrErrorSpy).toHaveBeenCalled();
    });

    it('should upload a settings file and apply the settings the backend returns', async () => {
      // GIVEN: the page shows the settings of the selected repository.
      const uploadSpy = jest.spyOn(ServiceProvider.get(GraphNavigatorService), 'uploadSettings')
        .mockResolvedValue(SETTINGS_B);
      const toastrSuccessSpy = jest.spyOn(ServiceProvider.get(OntoToastrService), 'success');
      fixture.detectChanges();
      await selectRepository(REPOSITORY_A);
      await settle();

      // WHEN: the settings controls ask for a file to be uploaded.
      const file = new File(['@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .'], 'settings.ttl');
      component.onUploadSettings(file, REPOSITORY_A.id);
      await settle();

      // THEN: the file is uploaded for the repository and the diagram uses the new settings.
      expect(uploadSpy).toHaveBeenCalledWith(REPOSITORY_A.id, file);
      expect(toastrSuccessSpy).toHaveBeenCalled();
      const facade = getFacade().componentInstance as GraphwiseReactodiaFacadeComponent;
      expect(facade.providerSettings()).toEqual(SETTINGS_B.getProviderSettings());
    });

    it('should report the failure and keep the settings when the upload is rejected', async () => {
      // GIVEN: the backend rejects the file with a validation message.
      jest.spyOn(ServiceProvider.get(GraphNavigatorService), 'uploadSettings')
        .mockRejectedValue(new Error('Invalid settings file'));
      const toastrErrorSpy = jest.spyOn(ServiceProvider.get(OntoToastrService), 'error');
      fixture.detectChanges();
      await selectRepository(REPOSITORY_A);
      await settle();

      // WHEN: a file is uploaded.
      component.onUploadSettings(new File([''], 'settings.ttl'), REPOSITORY_A.id);
      await settle();

      // THEN: the failure is reported and the diagram keeps the settings it had.
      expect(toastrErrorSpy).toHaveBeenCalled();
      const facade = getFacade().componentInstance as GraphwiseReactodiaFacadeComponent;
      expect(facade.providerSettings()).toEqual(SETTINGS_A.getProviderSettings());
    });

    it('should reset the settings by deleting them and loading the defaults', async () => {
      // GIVEN: the page shows uploaded settings.
      const deleteSpy = jest.spyOn(ServiceProvider.get(GraphNavigatorService), 'deleteSettings').mockResolvedValue();
      fixture.detectChanges();
      await selectRepository(REPOSITORY_A);
      await settle();

      // WHEN: the settings controls ask for a reset.
      getSettingsSpy.mockResolvedValue(SETTINGS_B);
      component.onResetSettings(REPOSITORY_A.id);
      await settle();

      // THEN: the settings are deleted and the ones the backend falls back to are applied.
      expect(deleteSpy).toHaveBeenCalledWith(REPOSITORY_A.id);
      expect(getSettingsSpy).toHaveBeenLastCalledWith(REPOSITORY_A.id);
      const facade = getFacade().componentInstance as GraphwiseReactodiaFacadeComponent;
      expect(facade.providerSettings()).toEqual(SETTINGS_B.getProviderSettings());
    });

    it('should show the settings controls when the user can maintain the repository', async () => {
      // GIVEN: the user can maintain the repository.
      canMaintainRepoSpy.mockReturnValue(true);

      // WHEN: the settings of the selected repository are loaded.
      fixture.detectChanges();
      await selectRepository(REPOSITORY_A);
      await settle();

      // THEN: the settings controls are shown.
      expect(fixture.nativeElement.querySelector('app-graph-navigator-settings')).not.toBeNull();
    });

    it('should hide the settings controls when the user cannot maintain the repository', async () => {
      // GIVEN: the user cannot maintain the repository.
      canMaintainRepoSpy.mockReturnValue(false);

      // WHEN: the settings of the selected repository are loaded.
      fixture.detectChanges();
      await selectRepository(REPOSITORY_A);
      await settle();

      // THEN: the settings controls are not shown, but the diagram is.
      expect(fixture.nativeElement.querySelector('app-graph-navigator-settings')).toBeNull();
      expect(getFacade()).not.toBeNull();
    });
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  describe('seeding the graph from query params', () => {
    it('should not load a graph when no query param is present', () => {
      // GIVEN: no query param.
      activatedRouteStub.snapshot.queryParams = {};

      // WHEN: the page initializes.
      fixture.detectChanges();

      // THEN: no graph is requested.
      expect(loadGraphForQuerySpy).not.toHaveBeenCalled();
    });

    it('should pass undefined for a missing flag so the service applies its defaults', () => {
      // GIVEN: a query without inference/sameAs params.
      activatedRouteStub.snapshot.queryParams = {query: QUERY};

      // WHEN: the page initializes.
      fixture.detectChanges();

      // THEN: the flags are undefined, letting the service fall back to its defaults.
      expect(loadGraphForQuerySpy).toHaveBeenCalledWith(QUERY, undefined, undefined);
    });

    it('should treat an empty flag as undefined rather than forcing it off', () => {
      // GIVEN: bare inference/sameAs params (present in the URL but without a value).
      activatedRouteStub.snapshot.queryParams = {query: QUERY, inference: '', sameAs: ''};

      // WHEN: the page initializes.
      fixture.detectChanges();

      // THEN: the empty flags resolve to undefined, not false.
      expect(loadGraphForQuerySpy).toHaveBeenCalledWith(QUERY, undefined, undefined);
    });

    it('should pass false when a flag is explicitly "false"', () => {
      // GIVEN: inference/sameAs explicitly set to false.
      activatedRouteStub.snapshot.queryParams = {query: QUERY, inference: 'false', sameAs: 'false'};

      // WHEN: the page initializes.
      fixture.detectChanges();

      // THEN: the explicit false is forwarded.
      expect(loadGraphForQuerySpy).toHaveBeenCalledWith(QUERY, false, false);
    });

    it('should pass true when a flag is explicitly "true"', () => {
      // GIVEN: inference/sameAs explicitly set to true.
      activatedRouteStub.snapshot.queryParams = {query: QUERY, inference: 'true', sameAs: 'true'};

      // WHEN: the page initializes.
      fixture.detectChanges();

      // THEN: the explicit true is forwarded.
      expect(loadGraphForQuerySpy).toHaveBeenCalledWith(QUERY, true, true);
    });

    it('should set the seed graph from the loaded links', async () => {
      // GIVEN: the service resolves with links.
      const links = [new GraphExploreLink({source: 'urn:a', target: 'urn:b', predicates: ['urn:p'], rawPredicates: ['p']})];
      loadGraphForQuerySpy.mockResolvedValue(links);
      activatedRouteStub.snapshot.queryParams = {query: QUERY};

      // WHEN: the page initializes and the request settles.
      fixture.detectChanges();
      await fixture.whenStable();

      // THEN: the resolved links seed the diagram and loading is cleared.
      expect(component.seedGraph()).toEqual(links);
      expect(component.loading()).toBe(false);
    });
  });
});
