import {ComponentFixture, TestBed} from '@angular/core/testing';
import {Component} from '@angular/core';

import {PageLayoutComponent} from './page-layout.component';
import {ActivatedRoute, provideRouter} from '@angular/router';
import {provideTranslocoForTesting} from '../../../testing-utils/transloco-utils';
import {provideNoopAnimations} from '@angular/platform-browser/animations';
import {Repository, RepositoryContextService, RepositoryList, ServiceProvider} from '@ontotext/workbench-api';
import {mockResizeObserverForTesting} from '../../../testing-utils/resize-observer-testing-utils';

function buildActivatedRouteMock(queryParams: Record<string, string> = {}, data: Record<string, unknown> = {}) {
  return {
    snapshot: {queryParams, data}
  };
}

@Component({
  imports: [PageLayoutComponent],
  template: '<app-page-layout><div class="projected-content">Page content</div></app-page-layout>'
})
class PageLayoutHostComponent {}

describe('PageLayoutComponent', () => {
  let component: PageLayoutComponent;
  let fixture: ComponentFixture<PageLayoutComponent>;
  let repositoryContextService: RepositoryContextService;

  mockResizeObserverForTesting();

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PageLayoutComponent, provideTranslocoForTesting()],
      providers: [
        {provide: ActivatedRoute, useValue: buildActivatedRouteMock()},
        provideNoopAnimations()
      ]
    })
      .compileComponents();

    repositoryContextService = ServiceProvider.get(RepositoryContextService);

    fixture = TestBed.createComponent(PageLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    repositoryContextService.updateSelectedRepository(undefined);
    repositoryContextService.updateRepositoryList(undefined as unknown as RepositoryList);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set embedded to false when the embedded query parameter is not present', () => {
    expect(component.embedded()).toBe(false);
  });

  it('should show the title container when not embedded', () => {
    const titleContainer = fixture.nativeElement.querySelector('.title-container');
    expect(titleContainer).not.toBeNull();
  });

  it('should hide the title container when embedded', () => {
    component.embedded.set(true);
    fixture.detectChanges();
    const titleContainer = fixture.nativeElement.querySelector('.title-container');
    expect(titleContainer).toBeNull();
  });

  it('should set embedded to true when the embedded query parameter is present', async () => {
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [PageLayoutComponent, provideTranslocoForTesting()],
      providers: [
        {provide: ActivatedRoute, useValue: buildActivatedRouteMock({embedded: ''})},
        provideNoopAnimations()
      ]
    }).compileComponents();

    const embeddedFixture = TestBed.createComponent(PageLayoutComponent);
    const embeddedComponent = embeddedFixture.componentInstance;
    embeddedFixture.detectChanges();

    expect(embeddedComponent.embedded()).toBe(true);
  });

  it('should set title from route data', async () => {
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [PageLayoutComponent, provideTranslocoForTesting()],
      providers: [
        {provide: ActivatedRoute, useValue: buildActivatedRouteMock({}, {title: 'my.title.key'})},
        provideNoopAnimations()
      ]
    }).compileComponents();

    const f = TestBed.createComponent(PageLayoutComponent);
    f.detectChanges();

    expect(f.componentInstance.title()).toBe('my.title.key');
  });

  it('should set helpInfo from route data', async () => {
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [PageLayoutComponent, provideTranslocoForTesting()],
      providers: [
        {provide: ActivatedRoute, useValue: buildActivatedRouteMock({}, {helpInfo: 'my.help.key'})},
        provideNoopAnimations()
      ]
    }).compileComponents();

    const f = TestBed.createComponent(PageLayoutComponent);
    f.detectChanges();

    expect(f.componentInstance.helpInfo()).toBe('my.help.key');
  });

  it('should set documentationLink from route data', async () => {
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [PageLayoutComponent, provideTranslocoForTesting()],
      providers: [
        {provide: ActivatedRoute, useValue: buildActivatedRouteMock({}, {documentationLink: 'https://docs.example.com'})},
        provideNoopAnimations()
      ]
    }).compileComponents();

    const f = TestBed.createComponent(PageLayoutComponent);
    f.detectChanges();

    expect(f.componentInstance.documentationLink()).toBe('https://docs.example.com');
  });

  it('should leave title undefined when not in route data', () => {
    expect(component.title()).toBeUndefined();
  });

  it('should leave helpInfo undefined when not in route data', () => {
    expect(component.helpInfo()).toBeUndefined();
  });

  it('should leave documentationLink undefined when not in route data', () => {
    expect(component.documentationLink()).toBeUndefined();
  });

  describe('embedded', () => {
    let hostFixture: ComponentFixture<PageLayoutHostComponent>;

    const renderEmbedded = async () => {
      TestBed.resetTestingModule();
      await TestBed.configureTestingModule({
        imports: [PageLayoutHostComponent, provideTranslocoForTesting()],
        providers: [
          provideRouter([]),
          {provide: ActivatedRoute, useValue: buildActivatedRouteMock({embedded: ''})},
          provideNoopAnimations()
        ]
      }).compileComponents();

      hostFixture = TestBed.createComponent(PageLayoutHostComponent);
      hostFixture.detectChanges();
      await hostFixture.whenStable();
      hostFixture.detectChanges();
    };

    const getProjectedContent = (): HTMLElement | null => hostFixture.nativeElement.querySelector('.projected-content');
    const getRestrictions = (): HTMLElement => hostFixture.nativeElement.querySelector('app-page-restrictions');

    it('should show the restrictions instead of the page content when no repository is selected', async () => {
      // GIVEN: A repository list without a selected repository
      repositoryContextService.updateRepositoryList(new RepositoryList([new Repository({id: 'repo'})]));

      // WHEN: The page is rendered embedded
      await renderEmbedded();

      // THEN: The restrictions are shown and the page content is not rendered
      expect(getRestrictions().querySelector('p-message')).not.toBeNull();
      expect(getProjectedContent()).toBeNull();
    });

    it('should render the page content when a repository is selected', async () => {
      // GIVEN: A selected repository
      const repository = new Repository({id: 'repo'});
      repositoryContextService.updateRepositoryList(new RepositoryList([repository]));
      await repositoryContextService.updateSelectedRepository(repository);

      // WHEN: The page is rendered embedded
      await renderEmbedded();

      // THEN: No restrictions are shown and the page content is rendered
      expect(getRestrictions().querySelector('p-message')).toBeNull();
      expect(getProjectedContent()).not.toBeNull();
    });
  });
});
