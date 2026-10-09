import {Component, CUSTOM_ELEMENTS_SCHEMA, input, OnDestroy, OnInit, signal, viewChild} from '@angular/core';
import {TranslocoPipe} from '@jsverse/transloco';
import {Button} from 'primeng/button';
import {
  service,
  RepositoryContextService,
  RepositoryPermissionType,
  RepositoryType,
  LicenseContextService,
  Repository,
  navigate,
  RepositoryState,
  SubscriptionList,
  AuthorizationService,
  RepositoryReference,
  getPathName,
  RepositoryService,
  RepositorySizeInfo,
} from '@ontotext/workbench-api';
import {NgClass} from '@angular/common';
import {TableModule} from 'primeng/table';
import {InputText} from 'primeng/inputtext';
import {IconField} from 'primeng/iconfield';
import {InputIcon} from 'primeng/inputicon';
import {Select} from 'primeng/select';
import {FormsModule} from '@angular/forms';
import {Tooltip} from 'primeng/tooltip';
import {RepositoryPickerListViewModel} from './repository-picker-list.view-model';
import {Checkbox} from 'primeng/checkbox';
import {Popover} from 'primeng/popover';
import {RepositoryInfo} from './models/repository-info';
import {LoggerProvider} from '../../services/logger/logger-provider';

/**
 * The delay, in milliseconds, before the repository information popover opens or closes.
 */
const REPOSITORY_INFO_DELAY = 300;

@Component({
  selector: 'app-repository-picker-list',
  imports: [
    TranslocoPipe,
    Button,
    NgClass,
    TableModule,
    InputText,
    IconField,
    InputIcon,
    Select,
    FormsModule,
    Tooltip,
    Checkbox,
    Popover,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './repository-picker-list.component.html',
  styleUrl: './repository-picker-list.component.scss',
})
export class RepositoryPickerListComponent implements OnInit, OnDestroy {
  private readonly repositoryContextService = service(RepositoryContextService);
  private readonly licenseContextService = service(LicenseContextService);
  private readonly authorizationService = service(AuthorizationService);
  private readonly repositoryService = service(RepositoryService);

  /**
   * Whether the component should show only repositories to which the user has write access
   * (e.g. when managing repositories), rather than all accessible repositories.
   * Defaults to <code>true</code>.
   */
  requireWriteAccess = input<boolean>(true);

  /**
   * The repository types used to filter the list. Only repositories whose type is included in this list are shown.
   * If the value is undefined or the array is empty, no type-based filtering is applied.
   */
  filterByTypes = input<RepositoryType[] | undefined>(undefined);

  /**
   * The repository permission the user must have for a repository to be included in the list.
   * If undefined, no permission-based filtering is applied.
   */
  filterByPermission = input<RepositoryPermissionType | undefined>(undefined);

  /**
   * Whether to display the repository name filter.
   * Defaults to `true`.
   */
  showNameFilter = input(true);

  /**
   * Whether to display the repository state filter.
   * Defaults to `true`.
   */
  showStateFilter = input(true);

  /**
   * Whether to display the filter for showing only local repositories.
   * Defaults to `true`.
   */
  showLocalOnlyFilter = input(true);

  /**
   * List of subscriptions to context changes, to be unsubscribed on component destroy.
   */
  private readonly subscriptions = new SubscriptionList();

  /**
   * The view model holds all data and visualization state for the component. It is implemented as a signal so that the
   * template can reactively update when the view model changes. The view model is updated in response to context
   * changes and user interactions (e.g. filtering).
   */
  readonly vm = signal(new RepositoryPickerListViewModel());

  /**
   * Expose the RepositoryState enum to the template for use in filtering and displaying repository states.
   */
  readonly RepositoryState = RepositoryState;

  /**
   * The data of the repository information popover: the repository it was opened for last, with what was loaded for it.
   */
  readonly repositoryInfo = signal<RepositoryInfo | undefined>(undefined);

  private readonly repositoryInfoPopover = viewChild<Popover>('repositoryInfoPopover');
  private popoverContentResizeObserver?: ResizeObserver;
  private repositionPopoverFrame = 0;
  private showRepositoryInfoTimeout?: ReturnType<typeof setTimeout>;
  private hideRepositoryInfoTimeout?: ReturnType<typeof setTimeout>;

  ngOnInit(): void {
    this.vm.update((vm) => {
      vm.repositoryList = this.getAllowedRepositories();
      vm.license = this.licenseContextService.getLicenseSnapshot();
      vm.canManageRepositories = this.authorizationService.isRepoManager();
      return vm;
    });

    this.subscriptions.addAll([
      this.repositoryContextService.onRepositoryListChanged(
        () => this.onRepositoryListChanged()),
    ]);
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribeAll();
    this.clearRepositoryInfoTimeouts();
    this.stopObservingInfoPopoverPosition();
  }

  /**
   * Navigates to the repository creation page, passing the current page as a query parameter to allow returning to it
   * after repository creation.
   */
  createRepository(): void {
    const currentPage = getPathName();
    navigate(`repository/create?previous=${currentPage}`);
  }

  /**
   * Updates the selected repository in the repository context when a repository is selected from the list.
   * @param repository The repository that was selected by the user.
   */
  async selectRepository(repository: Repository): Promise<void> {
    this.clearRepositoryInfoTimeouts();
    this.repositoryInfoPopover()?.hide();
    await this.repositoryContextService.updateSelectedRepository(repository.toRepositoryReference());
  }

  /**
   * Opens the repository information for a repository after a short delay. It is called when the mouse or the
   * keyboard focus enters the select button of the repository.
   *
   * @param repository The repository.
   * @param selectButton The select button of the repository, next to which the popover is placed.
   */
  scheduleShowRepositoryInfo(repository: Repository, selectButton: EventTarget | null): void {
    this.clearRepositoryInfoTimeouts();
    this.showRepositoryInfoTimeout = setTimeout(() => this.showRepositoryInfo(repository, selectButton), REPOSITORY_INFO_DELAY);
  }

  /**
   * Closes the repository information after a short delay, and cancels an opening that is still waiting. It is
   * called when the mouse or the keyboard focus leaves a select button or the popover.
   */
  scheduleHideRepositoryInfo(): void {
    this.clearRepositoryInfoTimeouts();
    this.hideRepositoryInfoTimeout = setTimeout(() => this.repositoryInfoPopover()?.hide(), REPOSITORY_INFO_DELAY);
  }

  /**
   * Cancels an opening and a closing of the repository information that are still waiting. At most one of them is
   * waiting at a time, and every change of what the mouse or the keyboard focus is on cancels it.
   *
   * It is also called when the mouse moves from the row onto the popover, which keeps the popover open.
   */
  clearRepositoryInfoTimeouts(): void {
    clearTimeout(this.showRepositoryInfoTimeout);
    clearTimeout(this.hideRepositoryInfoTimeout);
  }

  /**
   * Repositions the repository info popover when its content resizes. PrimeNG positions the popover only when it opens,
   * but the repository information renders asynchronously and can change its size afterward.
   */
  observeInfoPopoverPosition(): void {
    const popover = this.repositoryInfoPopover();
    const content = popover?.container?.querySelector('.repository-info-popover-content');
    if (!popover || !content) {
      return;
    }
    this.stopObservingInfoPopoverPosition();
    this.popoverContentResizeObserver = new ResizeObserver(() => {
      // Placing the popover inside the observer callback makes the browser report a resize loop, so it is done before
      // the next paint.
      cancelAnimationFrame(this.repositionPopoverFrame);
      this.repositionPopoverFrame = requestAnimationFrame(() => this.repositionPopover());
    });
    this.popoverContentResizeObserver.observe(content);
  }

  /**
   * Stops observing content size changes and cancels any pending repositioning. Called when the popover closes.
   */
  stopObservingInfoPopoverPosition(): void {
    cancelAnimationFrame(this.repositionPopoverFrame);
    this.popoverContentResizeObserver?.disconnect();
    this.popoverContentResizeObserver = undefined;
  }

  /**
   * Updates the filter query on the view model when the user types in the search input.
   * @param query The new filter query value.
   */
  onFilterQueryChange(query: string): void {
    this.vm.update((vm) => {
      vm.filterQuery = query;
      return vm;
    });
  }

  /**
   * Updates the state filter on the view model when the user selects a state from the dropdown.
   * @param state The new state filter value.
   */
  onStateFilterChange(state: RepositoryState | null): void {
    this.vm.update((vm) => {
      vm.stateFilter = state;
      return vm;
    });
  }

  /**
   * Updates the localOnly filter on the view model when the user toggle the local only checkbox.
   *
   * @param localOnly The new state filter value.
   */
  onLocalOnlyChange(localOnly: boolean): void {
    this.vm.update((vm) => {
      vm.localOnly = localOnly;
      return vm;
    });
  }

  /**
   * Opens the repository information next to the select button of a repository and loads fresh data for it: the
   * permission of the current user and the statement counts. Nothing is cached.
   *
   * The statement counts are requested only for a running repository, because the request starts a repository that
   * is not running.
   */
  private showRepositoryInfo(repository: Repository, selectButton: EventTarget | null): void {
    const popover = this.repositoryInfoPopover();
    if (!popover) {
      return;
    }
    if (popover.overlayVisible && this.repositoryInfo()?.repository === repository) {
      return;
    }

    const permission = this.authorizationService.getRepositoryPermission(repository);
    const isRunning = repository.state === RepositoryState.RUNNING;
    this.repositoryInfo.set({repository, permission, loading: isRunning});
    // The popover can still be open for another row, the one with the keyboard focus or the one under the mouse.
    const isOpenForAnotherRow = popover.overlayVisible;
    popover.show(null, selectButton);
    if (isOpenForAnotherRow) {
      // It is not opened again, so it has to be moved to the new row here.
      this.repositionPopover();
    }

    if (isRunning) {
      this.repositoryService.getRepositorySizeInfo(repository)
        .then((sizeInfo) => this.setLoadedSizeInfo(repository, sizeInfo))
        .catch((error) => {
          LoggerProvider.logger.error(`Failed to fetch the size of repository "${repository.id}"`, error);
          // Without the statement counts onto-repository-info shows that they are not available.
          this.setLoadedSizeInfo(repository);
        });
    }
  }

  /**
   * Ends the loading of the statement counts of a repository and sets what was loaded. The answer is ignored when the
   * popover was opened for another repository in the meantime.
   *
   * @param repository The repository the statement counts were requested for.
   * @param sizeInfo The statement counts. Undefined when the request has failed.
   */
  private setLoadedSizeInfo(repository: Repository, sizeInfo?: RepositorySizeInfo): void {
    this.repositoryInfo.update((info) =>
      info?.repository === repository ? {...info, loading: false, sizeInfo} : info);
  }

  /**
   * Places the open popover next to the select button it was opened for.
   *
   * PrimeNG marks a popover that is placed above its target as flipped, which puts the arrow at its bottom, and never
   * removes the mark. The mark is removed here first, so that a popover that moves from above one row to below
   * another one gets its arrow at the top again.
   */
  private repositionPopover(): void {
    const popover = this.repositoryInfoPopover();
    popover?.container?.classList.remove('p-popover-flipped');
    popover?.container?.removeAttribute('data-p-popover-flipped');
    popover?.align();
  }

  /**
   * Returns the repositories accessible to the current user after applying
   * the configured write-access, type, and permission restrictions.
   *
   * @returns The filtered collection of accessible repositories.
   */
  private onRepositoryListChanged(): void {
    this.vm.update((vm) => {
      vm.repositoryList = this.getAllowedRepositories();
      return vm;
    });
  }

  /**
   * Returns the repositories accessible to the current user after applying all
   * configured restrictions.
   *
   * @returns The filtered collection of accessible repositories.
   */
  private getAllowedRepositories() {
    return this.repositoryService.getAccessibleRepositories(true, this.requireWriteAccess())
      .filterByType(this.filterByTypes())
      .filter(this.createRepositoryPermissionFilter());
  }

  /**
   * Creates a predicate that filters repositories by the configured permission.
   * If no permission is configured, the predicate allows all repositories.
   *
   * @returns A predicate that determines whether a repository is permitted.
   */
  private createRepositoryPermissionFilter() {
    const filterByPermission = this.filterByPermission();
    return (repo: RepositoryReference) =>  !filterByPermission || this.authorizationService.hasRepoPermission(filterByPermission, repo);
  }
}
