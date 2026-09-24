import {Component, inject, OnDestroy, OnInit} from '@angular/core';
import {NavigationEnd, Router, RouterOutlet} from '@angular/router';
import {filter, Subscription} from 'rxjs';
import {ConfirmDialogModule} from 'primeng/confirmdialog';
import {RepositoryUrlSyncService} from './services/repository-url-sync.service';
import {
  ApplicationLifecycleContextService,
  EventName,
  EventService,
  getCurrentRoute, GuideApi,
  Repository,
  RepositoryContextService,
  RestrictionService,
  service,
  ViewRestriction,
  WindowService,
} from '@ontotext/workbench-api';
import {NotificationProviderService} from './services/notification/notification-provider.service';
import {YasguiComponentUtil} from './components/yasgui-component-facade/yasgui-component-util';
import {WorkbenchRouteData} from './models/route/workbench-route';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  imports: [
    RouterOutlet,
    ConfirmDialogModule
  ]
})
export class AppComponent implements OnInit, OnDestroy {
  private readonly router = inject(Router);
  private readonly repositoryUrlSyncService = inject(RepositoryUrlSyncService);
  private readonly repositoryContextService = service(RepositoryContextService);
  private readonly restrictionService = service(RestrictionService);
  private readonly eventService = service(EventService);
  private readonly subscriptions = new Subscription();
  private readonly appLifecyleService = service(ApplicationLifecycleContextService);
  private readonly notificationProviderService = inject(NotificationProviderService);

  private isFirstRepoChangeEvent = true;

  ngOnInit(): void {
    this.subscribeToRoutingEvents();
    this.subscribeToRepositoryChanges();
    this.subscribeToApplicationsStateBeforeChange();
    this.subscribeToNavigationEndEvent();
  }

  /**
   * Part of the micro-frontend guide-sync protocol (see ShepherdService class JSDoc).
   *
   * Injects Angular-specific services into {@link GuideApi} so they are ready before
   * the pending guide step is shown. Called only when this frontend is the one being loaded.
   */
  private updateGuideServices() {
    const guidesApi = service(GuideApi);
    guidesApi.YasguiComponentUtil = YasguiComponentUtil;
    guidesApi.toastr = this.notificationProviderService;
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  private onSelectedRepositoryChangedHandler(repo: Repository | undefined): void {
    if (this.isFirstRepoChangeEvent) {
      this.isFirstRepoChangeEvent = false;
      return;
    }
    if (repo) {
      this.repositoryUrlSyncService.onRepositoryChanged(repo.id);
    }
  }

  /**
   * Subscribe to single spa routing events to manually trigger Angular routing. This is needed, because
   * single spa does not trigger Angular's router events initially and a navigation may not happen.
   */
  private subscribeToRoutingEvents() {
    this.subscriptions.add(
      this.eventService.subscribe(EventName.NAVIGATION_END, () => {
        // The NAVIGATION_END handler should read query params from the browser URL directly, not rely on
        // queryParamsHandling: 'preserve' which reads from Angular's current route state (still the old route during
        // lazy-loading).
        const queryParams = Object.fromEntries(
          new URLSearchParams(WindowService.getLocationQueryParams())
        );
        this.router.navigate([getCurrentRoute()], {queryParams})
          .then(() => {
            this.repositoryUrlSyncService.syncRepositoryIdWithUrl();
          });
      })
    );
  }

  /**
   * Subscribes to selected repository changes and syncs the repository id into the URL,
   * ignoring the initial emission fired when the subscription is first registered.
   */
  private subscribeToRepositoryChanges(): void {
    this.subscriptions.add(
      this.repositoryContextService.onSelectedRepositoryChanged((repo) => this.onSelectedRepositoryChangedHandler(repo))
    );
  }

  /**
   * Part of the micro-frontend guide-sync protocol (see ShepherdService class JSDoc):
   * detects when this frontend is the one being loaded so updateGuideServices can inject services.
   */
  private subscribeToApplicationsStateBeforeChange(): void {
    this.subscriptions.add(
      this.appLifecyleService.onApplicationsStateBeforeChange((applicationsState) => {
        const isThisFELoading = applicationsState?.isNewAngularLoaded() ?? false;
        if (isThisFELoading) {
          this.updateGuideServices();
        }
      })
    );
  }

  /**
   * Recalculates the view restriction on every completed Angular navigation.
   */
  private subscribeToNavigationEndEvent(): void {
    this.subscriptions.add(
      this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe(() => {
        const routeData = this.getActiveRouteData();
        const restrictions = routeData?.viewRestrictions ?? [];
        this.restrictionService.updateViewRestriction(new ViewRestriction({restrictions}));
      })
    );
  }

  /**
   * Returns the route data of the deepest currently activated route.
   */
  private getActiveRouteData(): WorkbenchRouteData | undefined {
    let route = this.router.routerState.snapshot.root;
    while (route.firstChild) {
      route = route.firstChild;
    }
    return route.data as WorkbenchRouteData;
  }
}
