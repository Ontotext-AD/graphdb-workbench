import {ComponentFixture, TestBed} from '@angular/core/testing';

import {PageLayoutComponent} from './page-layout.component';
import {CommonModule} from '@angular/common';
import {ActivatedRoute} from '@angular/router';
import {provideTranslocoForTesting} from '../../../testing-utils/transloco-utils';
import {provideNoopAnimations} from '@angular/platform-browser/animations';
import {Repository, RepositoryContextService, RepositoryList, ServiceProvider} from '@ontotext/workbench-api';

function buildActivatedRouteMock(queryParams: Record<string, string> = {}, data: Record<string, unknown> = {}) {
  return {
    snapshot: {queryParams, data}
  };
}

describe('PageLayoutComponent', () => {
  let component: PageLayoutComponent;
  let fixture: ComponentFixture<PageLayoutComponent>;
  let repositoryContextService: RepositoryContextService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PageLayoutComponent, CommonModule, provideTranslocoForTesting()],
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
      imports: [PageLayoutComponent, CommonModule, provideTranslocoForTesting()],
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
      imports: [PageLayoutComponent, CommonModule, provideTranslocoForTesting()],
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
      imports: [PageLayoutComponent, CommonModule, provideTranslocoForTesting()],
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
      imports: [PageLayoutComponent, CommonModule, provideTranslocoForTesting()],
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

  describe('repository-required-banner visibility', () => {
    it('should show the banner when no repository is selected', () => {
      const banner = fixture.nativeElement.querySelector('app-repository-required-banner');
      expect(banner).not.toBeNull();
    });

    it('should hide the banner when a repository is already selected on init', async () => {
      TestBed.resetTestingModule();
      await TestBed.configureTestingModule({
        imports: [PageLayoutComponent, CommonModule, provideTranslocoForTesting()],
        providers: [
          {provide: ActivatedRoute, useValue: buildActivatedRouteMock()},
          provideNoopAnimations()
        ]
      }).compileComponents();

      const repoContextService = ServiceProvider.get(RepositoryContextService);
      const repository = new Repository({id: 'test', location: '', uri: 'http://test'});
      repoContextService.updateRepositoryList(new RepositoryList([repository]));
      await repoContextService.updateSelectedRepository(repository);

      const f = TestBed.createComponent(PageLayoutComponent);
      f.detectChanges();

      const banner = f.nativeElement.querySelector('app-repository-required-banner');
      expect(banner).toBeNull();
    });

    it('should hide the banner reactively when a repository is selected after init', async () => {
      const repository = new Repository({id: 'test', location: '', uri: 'http://test'});
      repositoryContextService.updateRepositoryList(new RepositoryList([repository]));

      let banner = fixture.nativeElement.querySelector('app-repository-required-banner');
      expect(banner).not.toBeNull();

      await repositoryContextService.updateSelectedRepository(repository);
      fixture.detectChanges();

      banner = fixture.nativeElement.querySelector('app-repository-required-banner');
      expect(banner).toBeNull();
    });

    it('should show the banner again when the selected repository is cleared', async () => {
      const repository = new Repository({id: 'test', location: '', uri: 'http://test'});
      repositoryContextService.updateRepositoryList(new RepositoryList([repository]));
      await repositoryContextService.updateSelectedRepository(repository);
      fixture.detectChanges();

      expect(fixture.nativeElement.querySelector('app-repository-required-banner')).toBeNull();

      await repositoryContextService.updateSelectedRepository(undefined);
      fixture.detectChanges();

      expect(fixture.nativeElement.querySelector('app-repository-required-banner')).not.toBeNull();
    });

    it('should unsubscribe from repository changes on destroy', () => {
      const unsubscribeSpy = jest.spyOn(component['subscriptions'], 'unsubscribeAll');
      component.ngOnDestroy();
      expect(unsubscribeSpy).toHaveBeenCalled();
    });
  });
});
