import {Component, inject, OnDestroy, OnInit} from '@angular/core';
import {Router, RouterOutlet} from '@angular/router';
import {EventName, EventService, getCurrentRoute, service, WindowService} from '@ontotext/workbench-api';
import {Subscription} from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  imports: [
    RouterOutlet
  ]
})
export class AppComponent implements OnInit, OnDestroy {
  private readonly router = inject(Router);
  private readonly eventService = service(EventService);
  private readonly subscriptions = new Subscription();

  ngOnInit(): void {
    this.subscribeToRoutingEvents();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
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
        this.router.navigate([getCurrentRoute()], {queryParams});
      })
    );
  }
}
