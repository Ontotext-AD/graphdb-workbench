import {Component, inject, OnDestroy, OnInit} from '@angular/core';
import {Router, RouterOutlet} from '@angular/router';
import {Subscription} from 'rxjs';
import {ConfirmDialogModule} from 'primeng/confirmdialog';
import {RepositoryUrlSyncService} from './services/repository-url-sync.service';
import {
  ApplicationLifecycleContextService,
  EventName,
  EventService,
  getCurrentRoute, GuideApi,
  Repository,
  RepositoryContextService,
  service,
  WindowService,
} from '@ontotext/workbench-api';
import {NotificationProviderService} from './services/notification/notification-provider.service';
import {YasguiComponentUtil} from './components/yasgui-component-facade/yasgui-component-util';

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
  private readonly eventService = service(EventService);
  private readonly subscriptions = new Subscription();
  private readonly appLifecyleService = service(ApplicationLifecycleContextService);
  private readonly notificationProviderService = inject(NotificationProviderService);

  private isFirstRepoChangeEvent = true;

  ngOnInit(): void {
    this.subscribeToRoutingEvents();
    this.subscriptions.add(
      this.repositoryContextService.onSelectedRepositoryChanged((repo) => this.onSelectedRepositoryChangedHandler(repo))
    );

    // Part of the micro-frontend guide-sync protocol (see ShepherdService class JSDoc):
    // detects when this frontend is the one being loaded so updateGuideServices can inject services.
    const applicationsStateBeforeChangeSubscription = this.appLifecyleService.onApplicationsStateBeforeChange((applicationsState) => {
      const isThisFELoading = applicationsState?.isNewAngularLoaded() ?? false;
      if (isThisFELoading) {
        this.updateGuideServices();
      }
    });
    this.subscriptions.add(applicationsStateBeforeChangeSubscription);
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
}
