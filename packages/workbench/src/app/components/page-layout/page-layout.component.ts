import {Component, inject, OnDestroy, OnInit, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ActivatedRoute} from '@angular/router';
import {ApplicationQueryParams} from '../../models/application-query-params';
import {TranslocoPipe} from '@jsverse/transloco';
import {PageInfoTooltipComponent} from '../page-info-tooltip/page-info-tooltip.component';
import {RepositoryRequiredBannerComponent} from '../repository-required-banner/repository-required-banner.component';
import {
  service,
  RepositoryContextService,
  Repository,
  SubscriptionList,
} from '@ontotext/workbench-api';

@Component({
  selector: 'app-page-layout',
  standalone: true,
  imports: [
    CommonModule,
    TranslocoPipe,
    PageInfoTooltipComponent,
    RepositoryRequiredBannerComponent
  ],
  templateUrl: './page-layout.component.html',
  styleUrl: './page-layout.component.scss'
})
export class PageLayoutComponent implements OnInit, OnDestroy {
  private readonly repositoryContextService = service(RepositoryContextService);

  private readonly activatedRoute = inject(ActivatedRoute);

  embedded = signal(false);
  title = signal<string | undefined>(undefined);
  helpInfo = signal<string | undefined>(undefined);
  documentationLink = signal<string | undefined>(undefined);
  selectedRepository = signal<Repository | undefined>(undefined);

  private readonly subscriptions = new SubscriptionList();

  ngOnInit(): void {
    this.selectedRepository.set(this.repositoryContextService.getSelectedRepository());
    this.subscriptions.add(
      this.repositoryContextService.onSelectedRepositoryChanged((repo) => {
        this.selectedRepository.set(repo);
      })
    );

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
}
