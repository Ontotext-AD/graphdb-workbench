import {Component, Host, h, State} from '@stencil/core';
import {
  Repository,
  RepositoryStorageService,
  ServiceProvider,
  RepositoryService,
  RepositoryList,
  RepositoryContextService,
  UriUtil, RepositorySizeInfo, LanguageService, LanguageContextService
} from "@ontotext/workbench-api";
import {DropdownItem} from '../../models/dropdown/dropdown-item';
import {DropdownItemAlignment} from '../../models/dropdown/dropdown-item-alignment';
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
  private repositoryService = ServiceProvider.get(RepositoryService);
  private repositoryContextService = ServiceProvider.get(RepositoryContextService);
  private repositoryStorageService = ServiceProvider.get(RepositoryStorageService);
  private totalTripletsFormatter: Intl.NumberFormat;
  private currentRepositoryId: string;
  private items: DropdownItem<Repository>[] = [];
  private readonly subscriptions: (() => void)[] = [];

  /**
   * The default name of the toggle button that will be displayed in the dropdown.
   */
  @State() defaultToggleButtonName: string;

  /**
   * The list of repositories in the database.
   */
  @State() private repositoryList: RepositoryList;

  /**
   * The model of the currently selected repository, if any.
   */
  @State() currentRepository: Repository;

  constructor() {
    this.setupTotalRepository();
    // get the current repository id from the storage
    this.currentRepositoryId = this.repositoryStorageService.get(this.repositoryContextService.SELECTED_REPOSITORY_ID).getValueOrDefault(undefined);
    this.items = this.getRepositoriesDropdownItems();

    // These should stay after the initialization of the currentRepositoryId because the repository list change handler
    // depends on it and would reset the current repository in the storage if it is not set.
    this.subscriptions.push(this.subscribeToRepositoryListChanged());
    this.subscriptions.push(this.subscribeToSelectedRepositoryChanged());
    this.subscriptions.push(this.subscribeToTranslationChanged());
    this.subscriptions.push(this.subscribeToLanguageChanged());
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
          onValueChanged={this.onValueChanged()}
          dropdownButtonName={<SelectorButton repository={this.currentRepository} defaultToggleButtonName={this.defaultToggleButtonName}  location={this.getLocation()}/>}
          dropdownButtonTooltip={this.getRepositoryTooltipFunction(this.currentRepository)}
          dropdownTooltipTrigger='mouseenter focus'
          dropdownAlignment={DropdownItemAlignment.RIGHT}
          tooltipTheme='light-border'
          items={this.items}>
        </onto-dropdown>
      </Host>
    );
  }

  private onValueChanged() {
    return (valueChangeEvent: CustomEvent) => this.onRepositoryChanged(valueChangeEvent.detail);
  }

  private subscribeToRepositoryListChanged(): () => void {
    return this.repositoryContextService.onRepositoryListChanged((repositories: RepositoryList) => {
      if (!repositories) {
        this.resetOnMissingRepositories();
      } else {
        this.initOnRepositoryListChanged(repositories);
      }
    });
  }

  private initOnRepositoryListChanged(repositories: RepositoryList): void {
    this.repositoryList = repositories;
    const location = '';
    const repository = repositories.findRepository(this.currentRepositoryId, location);
    // currently selected repository could be deleted and not in the list at this point
    this.currentRepository = repository;
    this.repositoryContextService.updateSelectedRepository(repository);
    this.repositoryContextService.updateSelectedRepositoryId(this.currentRepositoryId);
    this.items = this.getRepositoriesDropdownItems();
  }

  private resetOnMissingRepositories(): void {
    this.items = [];
    this.repositoryList = new RepositoryList();
    this.currentRepositoryId = undefined;
    this.currentRepository = undefined;
  }

  private subscribeToSelectedRepositoryChanged(): () => void {
    return this.repositoryContextService.onSelectedRepositoryIdChanged((selectedRepositoryId) => this.changeRepository(selectedRepositoryId));
  }

  private subscribeToTranslationChanged(): () => void {
    return TranslationService.onTranslate('repository-selector.btn.toggle', [], (toggleButtonName) => {
      this.defaultToggleButtonName = toggleButtonName;
    })
  }

  private subscribeToLanguageChanged(): () => void {
    return ServiceProvider.get(LanguageContextService)
      .onSelectedLanguageChanged((language) => this.setupTotalRepository(language));
  }

  private changeRepository(newRepositoryId: string): void {
    this.currentRepository = this.repositoryList.findRepository(newRepositoryId, '');
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
        .map((repository) => {
          return new DropdownItem<Repository>()
            .setName(<SelectorItemButton repository={repository}/>)
            .setTooltip(this.getRepositoryTooltipFunction(repository))
            .setValue(repository)
            .setDropdownTooltipTrigger('mouseenter focus')
        });
  }

  private onRepositoryChanged(selectedRepository: Repository): void {
    this.repositoryContextService.updateSelectedRepository(selectedRepository);
  }

  private getLocation() {
    if (this.currentRepository && this.currentRepository.location) {
      return `@${UriUtil.shortenIri(this.currentRepository.location)}`;
    }
    return ``;
  }

  private getRepositoryTooltipFunction(repository: Repository): () => Promise<string> {
    return () => {
      if (!repository) {
        return Promise.resolve('');
      }
      return this.repositoryService.getRepositorySizeInfo(repository)
        .then((repositorySizeInfo: RepositorySizeInfo) => this.buildRepositoryTooltipHtml(repository, repositorySizeInfo));
    }
  }

  private buildRepositoryTooltipHtml(repository: Repository, repositorySizeInfo: RepositorySizeInfo): string {
    let repositoryTooltipHtml = `
            <div class="repository-tooltip-title">
                    <span class="label">${TranslationService.translate('repository-selector.tooltip.repository')}</span> <span class="value">${repository.id}</span>
            </div>
            <div class="repository-tooltip-content">
                <div class="repository-tooltip-row">
                    <div class="label">${TranslationService.translate('repository-selector.tooltip.location')} :</div>
                    <div class="value">${repository.location ? repository.location : TranslationService.translate('repository-selector.tooltip.local')}</div>
                </div>
                <div class="repository-tooltip-row">
                    <div class="label">${TranslationService.translate('repository-selector.tooltip.type')} :</div>
                    <div class="value">${TranslationService.translate('repository-selector.tooltip.types.' + (repository.type ? repository.type : 'unknown'))}</div>
                </div>
                 <div class="repository-tooltip-row">
                    <div class="label">${TranslationService.translate('repository-selector.tooltip.access')} :</div>
                    <div class="value">${TranslationService.translate(this.canWriteRepoInLocation(repository) ? 'repository-selector.tooltip.accesses.read_write' : 'repository-selector.tooltip.accesses.read')}</div>
                </div>`;

    repositoryTooltipHtml += this.buildRepositorySizeInfoHtml(repositorySizeInfo);

    repositoryTooltipHtml += '</div>';
    return repositoryTooltipHtml
  }

  private buildRepositorySizeInfoHtml(repositorySizeInfo: RepositorySizeInfo): string {
    let repositorySizeInfoHtml = '';
    if (!repositorySizeInfo || repositorySizeInfo.total < 0) {
      return repositorySizeInfoHtml;
    }
    repositorySizeInfoHtml += `
      <div class="repository-tooltip-row total">
        <div class="label">${TranslationService.translate('repository-selector.tooltip.repository-size.total')} :</div>
        <div class="value">${repositorySizeInfo.total > 0 ? this.totalTripletsFormatter.format(repositorySizeInfo.total) : 0}</div>
      </div>`

    if (repositorySizeInfo.explicit >= 0) {
      repositorySizeInfoHtml += `<div class="repository-tooltip-row">
        <div class="label">${TranslationService.translate('repository-selector.tooltip.repository-size.explicit')} :</div>
        <div class="value">${repositorySizeInfo.explicit > 0 ? this.totalTripletsFormatter.format(repositorySizeInfo.explicit) : 0}</div>
      </div>`
    }

    if (repositorySizeInfo.inferred >= 0) {
      repositorySizeInfoHtml += `<div class="repository-tooltip-row">
        <div class="label">${TranslationService.translate('repository-selector.tooltip.repository-size.inferred')} :</div>
        <div class="value">${repositorySizeInfo.inferred > 0 ? this.totalTripletsFormatter.format(repositorySizeInfo.inferred) : 0}</div>
      </div>`
    }

    if (repositorySizeInfo.total >= 0 && repositorySizeInfo.explicit >= 0) {
      repositorySizeInfoHtml += `<div class="repository-tooltip-row">
        <div class="label">${TranslationService.translate('repository-selector.tooltip.repository-size.expansion_ratio')} :</div>
        <div class="value">${repositorySizeInfo.explicit > 0 ? this.totalTripletsFormatter.format(repositorySizeInfo.total / repositorySizeInfo.explicit) : '-'}</div>
      </div>`
    }
    return repositorySizeInfoHtml;
  }

  private setupTotalRepository(language = LanguageService.DEFAULT_LANGUAGE): void {
    this.totalTripletsFormatter = new Intl.NumberFormat(language, {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });
  }

  private canWriteRepoInLocation(_repository: Repository): boolean {
    // TODO: implement the condition when GDB-10442 is ready
    return true;
  }
}
