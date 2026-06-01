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
   * Fixed set of options for the state filter dropdown.
   */
  readonly stateFilterOptions: StateFilterOption[] = [
    {label: 'components.repository_picker_list.state_filter.all', value: null},
    {label: 'components.repository_picker_list.state_filter.running', value: RepositoryState.RUNNING},
    {label: 'components.repository_picker_list.state_filter.inactive', value: RepositoryState.INACTIVE},
  ];

  /**
   * Returns the repositories matching the current filterQuery and stateFilter.
   */
  get filteredRepositoryList(): Repository[] {
    const query = this.filterQuery.trim().toLowerCase();
    const state = this.stateFilter;
    return this.repositoryList.filter((repo) => {
      const matchesQuery =
        !query ||
        repo.id?.toLowerCase().includes(query) ||
        repo.title?.toLowerCase().includes(query);
      const matchesState = state === null || repo.state === state;
      return matchesQuery && matchesState;
    });
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
