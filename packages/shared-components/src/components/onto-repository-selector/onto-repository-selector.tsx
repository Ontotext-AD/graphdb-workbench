import {Component, h, Host, Prop, State, Watch} from '@stencil/core';
import {
  getRepositoryIdWithLocation,
  Repository,
  RepositoryContextService,
  RepositoryPermissionType,
  RepositorySizeInfo,
  RepositoryState,
  service,
  UriUtil
} from '@ontotext/workbench-api';
import {DropdownItem} from '../../models/dropdown/dropdown-item';
import {DropdownItemAlignment} from '../../models/dropdown/dropdown-item-alignment';
import {RepositorySelection} from './repository-selection';
import {TranslationService} from '../../services/translation.service';
import {OntoTooltipPlacement} from '../onto-tooltip/models/onto-tooltip-placement';
import {escapeHtml} from '../../utils/html-utils';
import { LoggerProvider } from 'src/services/logger-provider';

@Component({
  tag: 'onto-repository-selector',
  styleUrl: 'onto-repository-selector.scss',
  shadow: false
})
/**
 * A StencilJS component that renders a repository selector dropdown. This component fetches the list of repositories
 * from the `RepositoryService` and displays them in a dropdown. It allows users to select a repository, and automatically
 * updates the current repository when a selection is made.
 *
 * @example
 *  <onto-repository-selector
 *             currentRepository={this.currentRepository}
 *             items={this.items}
 *             repositorySizeInfoFetcher={...}
 *             getRepositoryPermission={...}>
 *           </onto-repository-selector>
 */
export class OntoRepositorySelector {
  private readonly repositoryContextService = service(RepositoryContextService);
  private readonly subscriptions: (() => void)[] = [];
  // Both maps are keyed by the repository id with its location, because repositories in different locations can have
  // the same id.
  private readonly repositorySizeInfoCache = new Map<string, RepositorySizeInfo>();
  private readonly repositorySizeInfoRequests = new Map<string, Promise<RepositorySizeInfo>>();
  private dropdownElement?: HTMLOntoDropdownElement;

  /**
   * The currently selected repository.
   */
  @Prop() currentRepository: Repository;

  /**
   * The list of repositories to show in the dropdown.
   */
  @Prop() items: DropdownItem<Repository>[];

  /**
   * Fetches repository size info used to build tooltips.
   */
  @Prop() repositorySizeInfoFetcher: (repo: Repository) => Promise<RepositorySizeInfo>;

  /**
   * Determines whether the current user has write access to the repository.
   */
  @Prop() getRepositoryPermission: (repository: Repository) => RepositoryPermissionType;

  /**
   * The default name of the toggle button that will be displayed in the dropdown.
   */
  @State() defaultToggleButtonName: string;

  /**
   * The message to display when there are no repositories available.
   */
  @State() noRepositoriesButtonMessage: string;

  /**
   * A list derived from the `items` input prop, with tooltip functions attached.
   *
   * Tooltip generation is centralized here to ensure consistency and avoid redundant operations.
   */
  @State() dropdownItems: DropdownItem<Repository>[];

  /**
   * Re-applies tooltip functions to all dropdown items when the items prop changes.
   */
  @Watch('items')
  onItemsChanged(newItems: DropdownItem<Repository>[]) {
    if (!(newItems?.length)) {
      this.dropdownItems = [];
      return;
    }
    this.dropdownItems = this.attachTooltipsToItems(this.items);
  }

  connectedCallback() {
    this.subscriptions.push(...this.subscribeToTranslationChanged(), this.subscribeToRepositoryListChanged());

    // Manually apply tooltip functions to each item on first mount.
    if (this.items?.length) {
      this.dropdownItems = this.attachTooltipsToItems(this.items);
    } else {
      this.dropdownItems = [];
    }
  }

  /**
   * Cleans up the subscriptions when the component is removed from the DOM to avoid memory leaks.
   * This method unsubscribes from both the repository change and selected repository change events.
   */
  disconnectedCallback(): void {
    this.subscriptions.forEach((subscription) => subscription());
  }

  render() {
    const repositorySelection = <RepositorySelection repository={this.currentRepository}
      defaultToggleButtonName={this.getButtonLabel()}
      location={this.getLocation()}/>;
    return (
      <Host>
        <onto-dropdown
          ref={(elementRef) => this.dropdownElement = elementRef}
          class="onto-repository-selector"
          data-test={'onto-repository-selector'}
          onValueChanged={this.onValueChanged()}
          dropdownButtonName={repositorySelection}
          dropdownButtonTooltip={this.createTooltipFunctionForRepository(this.currentRepository)}
          {...(this.currentRepository ? {'dropdownButtonGuideSelector': `repository-id-${this.currentRepository.id}`} : {})}
          dropdownAlignment={DropdownItemAlignment.RIGHT}
          tooltipPlacement={this.tooltipAlignment}
          tooltipTheme="light-border"
          tooltipClass="repository-selector-tooltip"
          items={this.dropdownItems}
          onMouseLeave={this.clearRepositorySizeInfo}
          auto-close>
        </onto-dropdown>
      </Host>
    );
  }

  private attachTooltipsToItems(items: DropdownItem<Repository>[]): DropdownItem<Repository>[] {
    if (!items) {
      return [];
    }
    return items.map((item) => item.setTooltip(this.createTooltipFunctionForRepository(item.value)));
  }

  private tooltipAlignment(isOpen: boolean): OntoTooltipPlacement {
    if (isOpen) {
      return OntoTooltipPlacement.LEFT;
    }
    return OntoTooltipPlacement.BOTTOM;
  }

  private onValueChanged() {
    return (valueChangeEvent: CustomEvent) => this.onRepositoryChanged(valueChangeEvent.detail);
  }

  /**
   * Returns an async function that generates HTML tooltip content for the given repository.
   */
  private createTooltipFunctionForRepository(repository: Repository): () => Promise<string> {
    return () => {
      if (!repository) {
        return Promise.resolve('');
      }

      if (repository.state !== RepositoryState.RUNNING) {
        return this.buildRepositoryTooltipHtml(repository);
      }

      const repositoryKey = getRepositoryIdWithLocation(repository);
      const repositorySizeInfo = this.repositorySizeInfoCache.get(repositoryKey);

      if (repositorySizeInfo) {
        return this.buildRepositoryTooltipHtml(repository, repositorySizeInfo);
      }

      if (!this.repositorySizeInfoRequests.has(repositoryKey)) {
        this.fetchRepositorySizeInfo(repository);
      }

      return this.buildRepositoryTooltipHtml(repository, undefined, true);
    };
  }

  private fetchRepositorySizeInfo(repository: Repository): void {
    const repositoryKey = getRepositoryIdWithLocation(repository);
    const repositorySizeInfoRequest = this.repositorySizeInfoFetcher(repository);

    this.repositorySizeInfoRequests.set(repositoryKey, repositorySizeInfoRequest);

    repositorySizeInfoRequest.then((repositorySizeInfo) => {
      this.repositorySizeInfoCache.set(repositoryKey, repositorySizeInfo);
    }).catch((err) => {
      LoggerProvider.logger.error('Failed to fetch repository size.', err);
    }).finally(() => {
      // The map may have been emptied in the meantime and may hold a newer request for the same repository.
      if (this.repositorySizeInfoRequests.get(repositoryKey) === repositorySizeInfoRequest) {
        this.repositorySizeInfoRequests.delete(repositoryKey);
      }
      void this.dropdownElement?.refreshButtonTooltip();
    });
  }

  /**
   * Builds the HTML string used as tooltip content for a repository. The content is rendered by the
   * <code>onto-repository-info</code> component, which gets its data as escaped JSON attributes.
   */
  private buildRepositoryTooltipHtml(repository: Repository, repositorySizeInfo?: RepositorySizeInfo, isLoadingRepositorySize = false): Promise<string> {
    const attributes = [
      `repository="${escapeHtml(JSON.stringify(repository))}"`,
      `permission="${escapeHtml(this.getRepositoryPermission(repository))}"`
    ];

    if (isLoadingRepositorySize) {
      attributes.push('loading="true"');
    }

    if (repositorySizeInfo) {
      attributes.push(`size-info="${escapeHtml(JSON.stringify(repositorySizeInfo))}"`);
    }

    return Promise.resolve(`<onto-repository-info ${attributes.join(' ')}></onto-repository-info>`);
  }

  /**
   * Forces an immediate button tooltip refresh when the repository list changes.
   */
  private subscribeToRepositoryListChanged(): () => void {
    return this.repositoryContextService.onRepositoryListChanged(() => {
      this.clearRepositorySizeInfo();
      void this.dropdownElement?.refreshButtonTooltip();
    });
  }

  private readonly clearRepositorySizeInfo = (): void => {
    this.repositorySizeInfoCache.clear();
    this.repositorySizeInfoRequests.clear();
  };

  private subscribeToTranslationChanged(): (() => void)[] {
    return [
      TranslationService.onTranslate('repository-selector.btn.toggle', [], (toggleButtonName) => {
        this.defaultToggleButtonName = toggleButtonName;
      }),
      TranslationService.onTranslate('repository-selector.btn.no_repositories', [], (noRepositoriesButtonMessage) => {
        this.noRepositoriesButtonMessage = noRepositoriesButtonMessage;
      })
    ];
  }

  private onRepositoryChanged(selectedRepository: Repository): void {
    this.repositoryContextService.updateSelectedRepository(selectedRepository);
  }

  private getLocation() {
    if (!this.currentRepository?.location) {
      return '';
    }
    return `@${UriUtil.shortenIri(this.currentRepository.location)}`;
  }

  private getButtonLabel() {
    return this.items?.length
      ? this.defaultToggleButtonName
      : this.noRepositoriesButtonMessage;
  }
}
