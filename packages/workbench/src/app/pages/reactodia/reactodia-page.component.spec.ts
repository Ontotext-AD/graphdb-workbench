import {ComponentFixture, TestBed} from '@angular/core/testing';
import {NO_ERRORS_SCHEMA} from '@angular/core';
import {ReactodiaPageComponent} from './reactodia-page.component';
import {provideTranslocoForTesting} from '../../../testing-utils/transloco-utils';
import {GraphExploreLink, GraphExploreService, LanguageContextService, ServiceProvider} from '@ontotext/workbench-api';
import {ActivatedRoute} from '@angular/router';

jest.mock('graphwise-reactodia/loader', () => ({
  defineCustomElements: jest.fn()
}));

describe('ReactodiaPageComponent', () => {
  const QUERY = 'CONSTRUCT WHERE { ?s ?p ?o }';
  let component: ReactodiaPageComponent;
  let fixture: ComponentFixture<ReactodiaPageComponent>;
  let loadGraphForQuerySpy: jest.SpyInstance;
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

    await TestBed.configureTestingModule({
      imports: [
        ReactodiaPageComponent,
        provideTranslocoForTesting()
      ],
      providers: [
        {provide: ActivatedRoute, useValue: activatedRouteStub}
      ],
      schemas: [NO_ERRORS_SCHEMA]
    })
      .compileComponents();

    fixture = TestBed.createComponent(ReactodiaPageComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    jest.restoreAllMocks();
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
