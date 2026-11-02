import {TestBed} from '@angular/core/testing';
import {AppComponent} from './app.component';
import {ActivatedRoute, Router} from '@angular/router';
import {ConfirmationService} from 'primeng/api';
import {TranslocoService} from '@jsverse/transloco';
import {
  ApplicationLifecycleContextService,
  EventService,
  LifecycleState,
  NavigationEnd as WorkbenchNavigationEnd,
  service,
} from '@ontotext/workbench-api';
import {RepositoryUrlSyncService} from './services/repository-url-sync.service';

describe('AppComponent', () => {
  const syncRepositoryIdWithUrl = jest.fn();

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [
        ConfirmationService,
        {provide: RepositoryUrlSyncService, useValue: {syncRepositoryIdWithUrl, onRepositoryChanged: jest.fn()}},
        {provide: TranslocoService, useValue: {translate: (key: string) => key}},
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { params: {}, queryParams: {} },
            paramMap: {
              get: () => null,
            },
          },
        },
      ]
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  describe('repository sync on navigation', () => {
    const lifecycleService = service(ApplicationLifecycleContextService);

    const navigate = async () => {
      service(EventService).emit(new WorkbenchNavigationEnd('old', 'new'));
      await new Promise((resolve) => setTimeout(resolve));
    };

    beforeEach(() => {
      syncRepositoryIdWithUrl.mockClear();
      jest.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('should sync immediately when the application data is loaded', async () => {
      // GIVEN: the application data is loaded.
      jest.spyOn(lifecycleService, 'getApplicationDataState').mockReturnValue(LifecycleState.DATA_LOADED);
      const fixture = TestBed.createComponent(AppComponent);
      fixture.detectChanges();

      // WHEN: a navigation ends.
      await navigate();

      // THEN: the repository is synced.
      expect(syncRepositoryIdWithUrl).toHaveBeenCalledTimes(1);
      fixture.destroy();
    });

    it('should defer the sync until the application data is loaded', async () => {
      // GIVEN: the application data is still loading.
      jest.spyOn(lifecycleService, 'getApplicationDataState').mockReturnValue(undefined);
      const fixture = TestBed.createComponent(AppComponent);
      fixture.detectChanges();

      // WHEN: navigations end.
      await navigate();
      await navigate();

      // THEN: the repository is not synced yet.
      expect(syncRepositoryIdWithUrl).not.toHaveBeenCalled();

      // WHEN: the application data is loaded.
      lifecycleService.updateApplicationDataState(LifecycleState.DATA_LOADED);

      // THEN: the repository is synced once.
      expect(syncRepositoryIdWithUrl).toHaveBeenCalledTimes(1);
      fixture.destroy();
    });
  });
});
