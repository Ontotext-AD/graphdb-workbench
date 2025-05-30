import {Component, Host, h, State, Prop, Watch} from '@stencil/core';
import {
  Repository,
  ServiceProvider,
  RepositoryContextService,
  UriUtil, RepositorySizeInfo,
} from "@ontotext/workbench-api";
import {DropdownItem} from '../../models/dropdown/dropdown-item';
import {DropdownItemAlignment} from '../../models/dropdown/dropdown-item-alignment';
import {SelectorButton} from './selector-button';
import {TranslationService} from '../../services/translation.service';
import {OntoTooltipPlacement} from "../onto-tooltip/models/onto-tooltip-placement";

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
 *  <onto-repository-selector
 *             currentRepository={this.currentRepository}
 *             items={this.items}
 *             repositorySizeInfoFetcher={...}
 *             totalTripletsFormatter={...}
 *             canWriteRepo={...}>
 *           </onto-repository-selector>
 */
export class OntoRepositorySelector {
  private readonly repositoryContextService = ServiceProvider.get(RepositoryContextService);
  private readonly subscriptions: (() => void)[] = [];

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
   * Formatter for numeric values in tooltips.
   */
  @Prop() totalTripletsFormatter: Intl.NumberFormat;

  /**
   * Determines whether the current user has write access to the repository.
   */
  @Prop() canWriteRepo: (repo: Repository) => boolean;

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
  private dropdownItems: DropdownItem<Repository>[];

  /**
   * Re-applies tooltip functions to all dropdown items when the items prop changes.
   */
  @Watch('items')
  onItemsChanged(newItems: DropdownItem<Repository>[]) {
    if (!newItems || !newItems.length) {
      this.dropdownItems = [];
      return;
    }

    this.dropdownItems = this.attachTooltipsToItems(this.items);
  }

  connectedCallback() {
    this.subscriptions.push(...this.subscribeToTranslationChanged());

    // Manually apply tooltip functions to each item on first mount.
    if (this.items && this.items.length) {
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
    const buttonLabel = this.getButtonLabel();
    return (
      <Host>
        <onto-dropdown
          class='onto-repository-selector'
          onValueChanged={this.onValueChanged()}
          dropdownButtonName={<SelectorButton repository={this.currentRepository} defaultToggleButtonName={buttonLabel}  location={this.getLocation()}/>}
          dropdownButtonTooltip={this.createTooltipFunctionForRepository(this.currentRepository)}
          dropdownTooltipTrigger='mouseenter focus'
          dropdownAlignment={DropdownItemAlignment.RIGHT}
          tooltipPlacement={this.tooltipAlignment}
          tooltipTheme='light-border'
          items={this.dropdownItems}>
        </onto-dropdown>
      </Host>
    );
  }

  private attachTooltipsToItems(items: DropdownItem<Repository>[]): DropdownItem<Repository>[] {
    return items && items.map((item) => item.setTooltip(this.createTooltipFunctionForRepository(item.value)));
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
    return async () => {
      if (!repository) {
        return '';
      }

      const repositorySizeInfo = await this.repositorySizeInfoFetcher(repository);
      return this.buildRepositoryTooltipHtml(repository, repositorySizeInfo);
    };
  }

  /**
   * Builds the complete HTML string used as tooltip content for a repository.
   */
  private buildRepositoryTooltipHtml(repository: Repository, repositorySizeInfo: RepositorySizeInfo): string {
    let html = `
    <div class="repository-tooltip-title">
      <span class="label">${TranslationService.translate('repository-selector.tooltip.repository')}</span>
      <span class="value">${repository.id}</span>
    </div>
    <div class="repository-tooltip-content">
      <div class="repository-tooltip-row">
        <div class="label">${TranslationService.translate('repository-selector.tooltip.location')} :</div>
        <div class="value">${repository.location ? repository.location : TranslationService.translate('repository-selector.tooltip.local')}</div>
      </div>
      <div class="repository-tooltip-row">
        <div class="label">${TranslationService.translate('repository-selector.tooltip.type')} :</div>
        <div class="value">${TranslationService.translate('repository-selector.tooltip.types.' + (repository.type || 'unknown'))}</div>
      </div>
      <div class="repository-tooltip-row">
        <div class="label">${TranslationService.translate('repository-selector.tooltip.access')} :</div>
        <div class="value">${TranslationService.translate(this.canWriteRepo(repository) ? 'repository-selector.tooltip.accesses.read_write' : 'repository-selector.tooltip.accesses.read')}</div>
      </div>`;

    html += this.buildRepositorySizeInfoHtml(repositorySizeInfo);
    html += '</div>';
    return html;
  }

  /**
   * Builds the repository size section of the tooltip.
   */
  private buildRepositorySizeInfoHtml(repositorySizeInfo: RepositorySizeInfo): string {
    if (!repositorySizeInfo || repositorySizeInfo.total < 0) {
      return '';
    }

    let html = `
    <div class="repository-tooltip-row total">
      <div class="label">${TranslationService.translate('repository-selector.tooltip.repository-size.total')} :</div>
      <div class="value">${this.totalTripletsFormatter.format(repositorySizeInfo.total)}</div>
    </div>`;

    if (repositorySizeInfo.explicit >= 0) {
      html += `
      <div class="repository-tooltip-row">
        <div class="label">${TranslationService.translate('repository-selector.tooltip.repository-size.explicit')} :</div>
        <div class="value">${this.totalTripletsFormatter.format(repositorySizeInfo.explicit)}</div>
      </div>`;
    }

    if (repositorySizeInfo.inferred >= 0) {
      html += `
      <div class="repository-tooltip-row">
        <div class="label">${TranslationService.translate('repository-selector.tooltip.repository-size.inferred')} :</div>
        <div class="value">${this.totalTripletsFormatter.format(repositorySizeInfo.inferred)}</div>
      </div>`;
    }

    if (repositorySizeInfo.total >= 0 && repositorySizeInfo.explicit > 0) {
      html += `
      <div class="repository-tooltip-row">
        <div class="label">${TranslationService.translate('repository-selector.tooltip.repository-size.expansion_ratio')} :</div>
        <div class="value">${this.totalTripletsFormatter.format(repositorySizeInfo.total / repositorySizeInfo.explicit)}</div>
      </div>`;
    }

    return html;
  }

  private subscribeToTranslationChanged(): Array<() => void> {
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
    if (this.currentRepository && this.currentRepository.location) {
      return `@${UriUtil.shortenIri(this.currentRepository.location)}`;
    }
    return ``;
  }

  private getButtonLabel() {
    return this.items?.length
      ? this.defaultToggleButtonName
      : this.noRepositoriesButtonMessage;
  }
}
