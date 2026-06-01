import {Component, computed, inject, input, OnDestroy, OnInit, signal} from '@angular/core';
import {
  service,
  RepositoryContextService,
  Repository,
  SubscriptionList,
  RepositoryList,
} from '@ontotext/workbench-api';
import {RepositoryPickerListComponent} from '../repository-picker-list/repository-picker-list.component';
import {Message} from 'primeng/message';
import {TranslocoPipe} from '@jsverse/transloco';
import {RouterLink} from '@angular/router';
import {RestrictionResolverService} from '../../services/page-restrictions/restriction-resolver.service';

@Component({
  selector: 'app-page-restrictions',
  standalone: true,
  imports: [
    RepositoryPickerListComponent,
    Message,
    TranslocoPipe,
    RouterLink,
  ],
  templateUrl: './page-restrictions.component.html',
  styleUrl: './page-restrictions.component.scss',
})
export class PageRestrictionsComponent implements OnInit, OnDestroy {
  /**
   * Current page title.
   */
  readonly title = input<string>();

  private readonly restrictionResolverService = inject(RestrictionResolverService);
  private readonly repositoryContextService = service(RepositoryContextService);

  repositoryList = signal<RepositoryList | undefined>(undefined);
  selectedRepository = signal<Repository | undefined>(undefined);
  isRestricted = signal<boolean>(false);

  private readonly subscriptions = new SubscriptionList();

  readonly restrictions = computed(() =>
    this.restrictionResolverService.resolve({
      selectedRepository: this.selectedRepository(),
      isRestricted: this.isRestricted(),
      pageTitle: this.title() ?? 'Missing page title',
    })
  );

  ngOnInit(): void {
    this.selectedRepository.set(this.repositoryContextService.getSelectedRepository());
    this.repositoryList.set(this.repositoryContextService.getRepositoryList());

    this.subscriptions.add(
      this.repositoryContextService.onSelectedRepositoryChanged((repo) => {
        this.selectedRepository.set(repo);
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribeAll();
  }
}
