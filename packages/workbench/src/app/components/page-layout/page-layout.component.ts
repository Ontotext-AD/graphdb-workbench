import {Component, inject, OnDestroy, OnInit, signal} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {ApplicationQueryParams} from '../../models/application-query-params';
import {TranslocoPipe} from '@jsverse/transloco';
import {PageInfoTooltipComponent} from '../page-info-tooltip/page-info-tooltip.component';
import {PageRestrictionsComponent} from '../page-restrictions/page-restrictions.component';
import {
  RestrictionContextService,
  service,
  SubscriptionList,
} from '@ontotext/workbench-api';

@Component({
  selector: 'app-page-layout',
  standalone: true,
  imports: [
    TranslocoPipe,
    PageInfoTooltipComponent,
    PageRestrictionsComponent
  ],
  templateUrl: './page-layout.component.html',
  styleUrl: './page-layout.component.scss'
})
export class PageLayoutComponent implements OnInit, OnDestroy {
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly restrictionContextService = service(RestrictionContextService);
  private readonly subscriptions = new SubscriptionList();

  embedded = signal(false);
  title = signal<string | undefined>(undefined);
  helpInfo = signal<string | undefined>(undefined);
  documentationLink = signal<string | undefined>(undefined);
  /**
   * Whether the page is restricted, i.e. at least one of its declared restriction conditions is satisfied.
   * When restricted, the restriction messages are shown instead of the page content.
   */
  isViewRestricted = signal<boolean>(false);

  ngOnInit(): void {
    this.subscribeToIsViewRestrictedChanges();
    this.getPageData();
    const queryParams = this.activatedRoute.snapshot.queryParams;
    if (queryParams.hasOwnProperty(ApplicationQueryParams.EMBEDDED)) {
      this.embedded.set(true);
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribeAll();
  }

  private getPageData(): void {
    const routeData = this.activatedRoute.snapshot.data;
    this.title.set(routeData['title']);
    this.helpInfo.set(routeData['helpInfo']);
    this.documentationLink.set(routeData['documentationLink']);
  }

  /**
   * Subscribes to changes in isViewRestricted.
   */
  private subscribeToIsViewRestrictedChanges(): void {
    this.subscriptions.add(
      this.restrictionContextService.onIsViewRestrictedChanged((isViewRestricted) => this.isViewRestricted.set(isViewRestricted))
    );
  }
}
