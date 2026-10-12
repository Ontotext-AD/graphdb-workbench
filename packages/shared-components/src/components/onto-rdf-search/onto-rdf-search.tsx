import {
  EventService, openInNewTab, ResourceSearchStorageService,
  SearchButton,
  SearchButtonConfig,
  ServiceProvider,
  SubscriptionList, SuggestionSelectedPayload, UriUtil
} from '@ontotext/workbench-api';
import {Component, h, Listen, State} from '@stencil/core';
import {TranslationService} from '../../services/translation.service';
import {HtmlUtil} from '../../utils/html-util';
import {OntoTooltipPlacement} from '../onto-tooltip/models/onto-tooltip-placement';
import {ResourceSearchConstants} from '../../models/resource-search/resource-search-constants';

/**
 * OntoRdfSearch component for RDF resource search.
 * This component is responsible for showing/hiding the search menu in the header
 */
@Component({
  tag: 'onto-rdf-search',
  styleUrl: 'onto-rdf-search.scss'
})
export class OntoRdfSearch {
  private readonly subscriptions: SubscriptionList = new SubscriptionList();
  private readonly eventService = ServiceProvider.get(EventService);
  private readonly resourceSearchStorageService = ServiceProvider.get(ResourceSearchStorageService);

  private readonly RDF_CONTEXT = 'rdfSearchContext';

  @State() private isOpen = false;
  @State() private buttonConfig: SearchButtonConfig;

  private redirectUrl: string = UriUtil.RESOURCE_URL;
  private rdfSearchRef: HTMLElement;
  /** Whether the search input should get the focus after the next render, i.e. the search area was just opened. */
  private shouldFocusSearchInput = false;
  /** Whether the search icon should get the focus after the next render, i.e. the search area was just closed. */
  private shouldFocusSearchIcon = false;

  /**
   * Handles click events on the window.
   * Closes the search area if it's open and the click is outside the search area.
   * @param event - The MouseEvent object.
   */
  @Listen('click', {target: 'window'})
  handleClick(event: MouseEvent) {
    if (!this.isOpen) {
      return;
    }
    if (!this.rdfSearchRef?.contains(event.target as Node)) {
      this.isOpen = false;
    }
  }

  connectedCallback() {
    this.onSuggestionSelected();
  }

  disconnectedCallback() {
    this.subscriptions.unsubscribeAll();
  }

  componentDidRender() {
    this.focusSearchInput();
    this.focusSearchIcon();
  }

  componentDidLoad() {
    this.buttonConfig = this.createButtonConfig();
  }

  render() {
    return (
      <section ref={(ref) => this.rdfSearchRef = ref}
        class="onto-rdf-search"
        onKeyDown={this.onKeyDown()}
        data-test='onto-rdf-search-component'>
        {/* The closed search area is only moved out of the view, so inert keeps it out of the tab order. */}
        <section class={`search-area ${this.isOpen ? 'visible' : 'invisible'}`}
          inert={!this.isOpen}>
          <button type="button"
            onClick={this.closeAndFocusSearchIcon}
            aria-label={TranslationService.translate('rdf_search.tooltips.close_search_area')}
            tooltip-content={TranslationService.translate('rdf_search.tooltips.close_search_area')}
            tooltip-placement={OntoTooltipPlacement.BOTTOM}
            data-test='onto-rdf-resource-search-close-btn'
            class="close-btn">
            <i class="ri-close-line" aria-hidden="true"></i>
          </button>
          <onto-search-resource-input buttonConfig={this.buttonConfig}
            preserveSearch={true}
            isHidden={!this.isOpen}
            data-test='onto-rdf-resource-search-input'
            context={this.RDF_CONTEXT}></onto-search-resource-input>
        </section>
        {!this.isOpen ? <onto-search-icon onClick={this.setIsOpen(true)}></onto-search-icon> : ''}
      </section>
    );
  }

  /**
   * Creates a function to set the open state of the search area.
   * @param isOpen - Boolean indicating whether the search area should be open.
   */
  private setIsOpen(isOpen: boolean) {
    return () => {
      this.isOpen = isOpen;
      if (this.isOpen) {
        this.shouldFocusSearchInput = true;
        this.loadSelectedViewFromStorage();
      }
    };
  }

  /**
   * Closes the search area and returns the focus to the search icon, which opened it.
   */
  private readonly closeAndFocusSearchIcon = () => {
    if (!this.isOpen) {
      return;
    }
    this.isOpen = false;
    this.shouldFocusSearchIcon = true;
  };

  /**
   * Creates the configuration for search buttons.
   * @returns A SearchButtonConfig object with radio buttons for table and visual search.
   */
  private createButtonConfig(): SearchButtonConfig {
    return new SearchButtonConfig({
      isRadio: true,
      buttons: [
        this.createSearchButton(
          ResourceSearchConstants.TABLE_VIEW,
          'rdf_search.buttons.table',
          () => {
            this.redirectUrl = UriUtil.RESOURCE_URL;
            this.resourceSearchStorageService.setSelectedView(ResourceSearchConstants.TABLE_VIEW);
          },
          true
        ),
        this.createSearchButton(
          ResourceSearchConstants.VISUAL_VIEW,
          'rdf_search.buttons.visual',
          () => {
            this.redirectUrl = UriUtil.GRAPHS_VISUALIZATIONS_URL;
            this.resourceSearchStorageService.setSelectedView(ResourceSearchConstants.VISUAL_VIEW);
          },
          false
        ),
        this.createSearchButton(
          ResourceSearchConstants.GRAPH_NAVIGATOR_VIEW,
          'rdf_search.buttons.graph_navigator',
          () => {
            this.redirectUrl = UriUtil.GRAPH_NAVIGATOR_URL;
            this.resourceSearchStorageService.setSelectedView(ResourceSearchConstants.GRAPH_NAVIGATOR_VIEW);
          },
          false
        ),
      ]
    });
  }

  /**
   * Creates a search button with the given parameters.
   * @param id - The id for the button.
   * @param labelKey - The key for the button's label translation.
   * @param callback - The function to be called when the button is clicked.
   * @param selected - Boolean indicating whether the button should be initially selected.
   * @returns A SearchButton object.
   */
  private createSearchButton(id: string, labelKey: string, callback: () => void, selected: boolean): SearchButton {
    return new SearchButton({
      label: TranslationService.translate(labelKey),
      id,
      callback,
      selected
    } as SearchButton);
  }

  private onSuggestionSelected() {
    this.subscriptions.add(
      this.eventService.subscribe<SuggestionSelectedPayload>(ResourceSearchConstants.SUGGESTION_SELECTED_EVENT, (payload) => {
        if (payload.getContext() === this.RDF_CONTEXT) {
          const redirectUrl = payload.getSuggestion().getOverrideToVisual()
            ? UriUtil.GRAPHS_VISUALIZATIONS_URL
            : this.redirectUrl;
          openInNewTab(UriUtil.createAutocompleteRedirect(redirectUrl, payload.getSuggestion().getValue()));
        }
      })
    );
  }

  private onKeyDown() {
    return (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        this.closeAndFocusSearchIcon();
      }
    };
  }

  private focusSearchInput() {
    if (this.isOpen && this.shouldFocusSearchInput) {
      this.shouldFocusSearchInput = false;
      HtmlUtil.focusElement(`#${this.RDF_CONTEXT}`);
    }
  }

  private focusSearchIcon() {
    if (this.isOpen || !this.shouldFocusSearchIcon) {
      return;
    }
    this.shouldFocusSearchIcon = false;
    // The search icon is rendered again, so wait for its button to be rendered.
    const searchIcon = this.rdfSearchRef?.querySelector('onto-search-icon') as HTMLOntoSearchIconElement;
    searchIcon?.componentOnReady()
      .then(() => searchIcon.querySelector('button')?.focus());
  }

  private loadSelectedViewFromStorage() {
    const selectedView = this.resourceSearchStorageService.getSelectedView();
    if (selectedView) {
      const selectedButton = this.buttonConfig.getButtons().find((button) => button.id === selectedView);
      if (selectedButton) {
        this.buttonConfig = this.buttonConfig.selectButton(selectedButton);
      }
    }
  }
}
