import {Component, inject, OnDestroy, OnInit} from '@angular/core';
import {Router, RouterOutlet} from '@angular/router';
import {Subscription} from 'rxjs';
import {ConfirmDialogModule} from 'primeng/confirmdialog';
import {RepositoryUrlSyncService} from './services/repository-url-sync.service';
import {
  AuthenticationService,
  EventName,
  EventService,
  getCurrentRoute,
  Repository,
  RepositoryContextService,
  service,
  WindowService
} from '@ontotext/workbench-api';

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
  private readonly authenticationService = service(AuthenticationService);
  private readonly subscriptions = new Subscription();

  private isFirstRepoChangeEvent = true;

  ngOnInit(): void {
    this.subscribeToRoutingEvents();
    this.subscriptions.add(
      this.repositoryContextService.onSelectedRepositoryChanged((repo) => this.onSelectedRepositoryChangedHandler(repo)),
    );
    this.subscriptions.add(this.eventService.subscribe(EventName.LOGOUT, () => this.authenticationService.logout()));
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
