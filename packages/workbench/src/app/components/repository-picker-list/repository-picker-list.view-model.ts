import {Repository, RepositoryState, License} from '@ontotext/workbench-api';

export interface StateFilterOption {
  label: string;
  value: RepositoryState | null;
}

/**
 * View model for the RepositoryPickerListComponent.
 * Holds all data and visualization state for the component.
 */
export class RepositoryPickerListViewModel {
  /**
   * Full list of repositories loaded from the context.
   */
  repositoryList: Repository[] = [];

  /**
   * The current license, used to control action visibility (e.g. "Select" button).
   */
  license: License | undefined = undefined;

  /**
   * Whether the user has permissions to manage repositories. If false, the "Create Repository" button will be hidden.
   */
  canManageRepositories = false;

  /**
   * Text typed into the search input to filter repositories by id or title.
   */
  filterQuery = '';

  /**
   * The currently selected state filter value. Null means "all".
   */
  stateFilter: RepositoryState | null = null;

  /**
   * Whether only local repositories should be displayed.
   */
  localOnly = true;

  /**
   * Fixed set of options for the state filter dropdown.
   */
  readonly stateFilterOptions: StateFilterOption[] = [
    {label: 'components.repository_picker_list.state_filter.all', value: null},
    {label: 'components.repository_picker_list.state_filter.running', value: RepositoryState.RUNNING},
    {label: 'components.repository_picker_list.state_filter.inactive', value: RepositoryState.INACTIVE},
  ];

  /**
   * Returns the repositories matching the filters.
   */
  get filteredRepositoryList(): Repository[] {
    return this.repositoryList
      .filter((repository) => this.matchesLocationFilter(repository))
      .filter((repository) => this.matchesSearchQuery(repository))
      .filter((repository) => this.matchesStateFilter(repository))
      .sort((repository1, repository2) =>
        this.sortLocalRepositoriesFirst(repository1, repository2)
      );
  }

  /**
   * Checks whether the repository matches the location filter.
   *
   * When {@link localOnly} is enabled, only local repositories are included.
   */
  private matchesLocationFilter(repository: Repository): boolean {
    return !this.localOnly || repository.local === true;
  }

  /**
   * Checks whether the repository matches the current search query.
   *
   * The search is case-insensitive and matches against the repository ID
   * and title. An empty query matches all repositories.
   */
  private matchesSearchQuery(repository: Repository): boolean {
    const query = this.filterQuery.trim().toLowerCase();

    return !query
      || repository.id?.toLowerCase().includes(query)
      || repository.title?.toLowerCase().includes(query);
  }

  /**
   * Checks whether the repository matches the selected state.
   *
   * When no state is selected, repositories in all states are included.
   */
  private matchesStateFilter(repository: Repository): boolean {
    return this.stateFilter === null || repository.state === this.stateFilter;
  }

  /**
   * Sorts repositories with local repositories first.
   *
   * Repositories within the same location type are sorted alphabetically by ID.
   */
  private sortLocalRepositoriesFirst(repository1: Repository, repository2: Repository): number {
    if (repository1.local === repository2.local) {
      return repository1.id.localeCompare(repository2.id);
    }
    return repository1.local ? -1 : 1;
  }

  /**
   * Whether the repository list toolbar filters should be shown.
   * Filters are only relevant when there is at least one repository.
   */
  get showFilters(): boolean {
    return this.repositoryList.length > 0;
  }

  /**
   * Whether the create repository button should be shown. Depends on user permissions and current license validity.
   */
  get canCreateRepository(): boolean {
    return this.canManageRepositories && !!this.license?.valid;
  }

  /**
   * Whether the repository table should be rendered.
   */
  get showRepositoryList(): boolean {
    return this.repositoryList.length > 0;
  }

  /**
   * Whether the select repository button should be shown for a row.
   */
  get canSelectRepository(): boolean {
    return !!this.license?.valid;
  }
}
