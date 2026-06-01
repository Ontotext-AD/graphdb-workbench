import {Component, input, OnDestroy, OnInit, signal} from '@angular/core';
import {TranslocoPipe} from '@jsverse/transloco';
import {Button} from 'primeng/button';
import {
  service,
  RepositoryContextService,
  LicenseContextService,
  Repository,
  navigate,
  WindowService,
  RepositoryState,
  SubscriptionList,
  AuthorizationService,
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
  ],
  templateUrl: './repository-picker-list.component.html',
  styleUrl: './repository-picker-list.component.scss',
})
export class RepositoryPickerListComponent implements OnInit, OnDestroy {
  private readonly repositoryContextService = service(RepositoryContextService);
  private readonly licenseContextService = service(LicenseContextService);
  private readonly authorizationService = service(AuthorizationService);

  /**
   * If the user has permissions to manage repositories for example.
   */
  isRestricted = input<boolean>(true);

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

  ngOnInit(): void {
    this.vm.update((vm) => {
      vm.repositoryList = this.authorizationService.getAccessibleRepositories(true, this.isRestricted()).getItems();
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
  }

  /**
   * Navigates to the repository creation page, passing the current page as a query parameter to allow returning to it
   * after repository creation.
   */
  createRepository(): void {
    const currentPage = WindowService.getLocationPathname();
    navigate(`/repository/create?previous=${currentPage}`);
  }

  /**
   * Updates the selected repository in the repository context when a repository is selected from the list.
   * @param repository The repository that was selected by the user.
   */
  async selectRepository(repository: Repository): Promise<void> {
    await this.repositoryContextService.updateSelectedRepository(repository.toRepositoryReference());
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

  private onRepositoryListChanged(): void {
    this.vm.update((vm) => {
      vm.repositoryList = this.authorizationService.getAccessibleRepositories(true, this.isRestricted()).getItems();
      return vm;
    });
  }
}
