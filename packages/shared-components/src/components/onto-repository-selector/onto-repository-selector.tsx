import {Component, Host, h, State} from '@stencil/core';
import {
  ServiceProvider,
  RepositoryService,
  RepositoryList,
  RepositoryContextService,
  UriUtil, RepositorySizeInfo, LanguageService, LanguageContextService
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
  private totalTripletsFormatter: Intl.NumberFormat;

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
    this.setupTotalRepository();
    this.loadRepositories();
    this.subscriptions.push(this.subscribeToRepositoriesChanged());
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
          onValueChanged={this.valueChangeHandler()}
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

  private subscribeToLanguageChanged(): () => void {
    return ServiceProvider.get(LanguageContextService)
      .onSelectedLanguageChanged((language) => this.setupTotalRepository(language));
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
        .setTooltip(this.getRepositoryTooltipFunction(repository))
        .setValue(repository)
        .setDropdownTooltipTrigger('mouseenter focus'));
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
