import {Component, Host, h, State} from '@stencil/core';
import {
  ServiceProvider,
  RepositoryService,
  RepositoryList,
  RepositoryContextService,
  UriUtil
} from "@ontotext/workbench-api";
import {DropdownItem} from '../../models/dropdown/dropdown-item';
import {DropdownItemAlignment} from '../../models/dropdown/dropdown-item-alignment';
import {Repository} from '@ontotext/workbench-api';
import {SelectorItemButton} from './selector-item';
import {SelectorButton} from './selector-button';
import {TranslationService} from '../../services/translation.service';

@Component({
  tag: 'onto-repository-selector',
  styleUrl: 'onto-repository-selector.scss',
  shadow: false,
})
/**
 * A StencilJS component that renders a repository selector dropdown. This component fetches the list of repositories
 * from the `RepositoryService` and displays them in a dropdown. It allows users to select a repository, and automatically
 * updates the current repository when a selection is made.
 *
 * @example
 * <onto-repository-selector></onto-repository-selector>
 */
export class OntoRepositorySelector {
  private repositoryService: RepositoryService;
  private repositoryContextService: RepositoryContextService;

  private repositoryList: RepositoryList;
  @State() defaultToggleButtonName: string;
  private readonly subscriptions: (() => void)[] = [];

  /**
   * A list of dropdown items representing repositories.
   */
  @State() items: DropdownItem<Repository>[] = [];

  /**
   * The currently selected repository, which will be shown in the dropdown button.
   */
  @State() currentRepository: Repository;

  constructor() {
    this.repositoryService = ServiceProvider.get(RepositoryService);
    this.repositoryContextService = ServiceProvider.get(RepositoryContextService);
    this.loadRepositories();
    this.subscriptions.push(this.subscribeToRepositoriesChanged());
    this.subscriptions.push(this.subscribeToSelectedRepositoryChanged());
    this.subscriptions.push(this.subscribeToTranslationChanged());
  }

  /**
   * Cleans up the subscriptions when the component is removed from the DOM to avoid memory leaks.
   * This method unsubscribes from both the repository change and selected repository change events.
   */
  disconnectedCallback(): void {
    this.subscriptions.forEach((subscription) => subscription());
  }

  render() {
    return (
      <Host>
        <onto-dropdown
          class='onto-repository-selector'
          onValueChanged={this.valueChangeHandler()}
          dropdownButtonName={<SelectorButton repository={this.currentRepository} defaultToggleButtonName={this.defaultToggleButtonName}  location={this.getLocation()}/>}
          dropdownAlignment={DropdownItemAlignment.RIGHT}
          items={this.items}>
        </onto-dropdown>
      </Host>
    );
  }

  private valueChangeHandler() {
    return (newRepository: any) => this.onRepositoryChanged(newRepository);
  }

  private loadRepositories(): void {
    this.repositoryService.getRepositories()
      .then((repositories) => {
        this.repositoryContextService.updateRepositories(repositories);
        const repositoryId = undefined;
        const location = undefined;
        const repository = repositories.findRepository(repositoryId, location);
        this.repositoryContextService.updateSelectedRepository(repository);
      });
  }

  private subscribeToRepositoriesChanged(): () => void {
    return this.repositoryContextService.onRepositoriesChanged((repositories: RepositoryList) => {
      this.repositoryList = repositories;
      this.items = this.getRepositoriesDropdownItems();
    });
  }

  private subscribeToSelectedRepositoryChanged(): () => void {
    return this.repositoryContextService.onSelectedRepositoryChanged((selectedRepository) => this.changeRepository(selectedRepository));
  }

  private subscribeToTranslationChanged(): () => void {
    return TranslationService.onTranslate('repository-selector.btn.toggle', [], (toggleButtonName) => {
      this.defaultToggleButtonName = toggleButtonName;
    })
  }

  private changeRepository(newRepository: Repository): void {
    this.currentRepository = newRepository;
    this.items = this.getRepositoriesDropdownItems();
  }

  private getRepositoriesDropdownItems(): DropdownItem<Repository>[] {
    if (!this.repositoryList) {
      return [];
    }
    this.repositoryList.sortByLocationAndId();
    let repositories: Repository[];
    if (this.currentRepository) {
      repositories = this.repositoryList.filterByIds([this.currentRepository.id]);
    } else {
      repositories = this.repositoryList.getItems();
    }
    // TODO: GDB-10442 filter if not rights to read repo see jwt-atuh.service.js canReadRepo function
    return repositories
        .map((repository) => new DropdownItem<Repository>()
            .setName(<SelectorItemButton repository={repository}/>)
            .setValue(repository));
  }

  private onRepositoryChanged(newRepositoryEvent: CustomEvent): void {
    this.repositoryContextService.updateSelectedRepository(newRepositoryEvent.detail)
  }

  private getLocation() {
    if (this.currentRepository && this.currentRepository.location) {
      return `@${UriUtil.shortenIri(this.currentRepository.location)}`;
    }
    return ``;
  }
}
