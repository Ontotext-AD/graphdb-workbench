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
import {OntoTooltipPlacement} from "../onto-tooltip/models/onto-tooltip-placement";
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

  @State() private isOpen: boolean = false;
  @State() private buttonConfig: SearchButtonConfig;

  private redirectUrl: string = UriUtil.RESOURCE_URL;
  private rdfSearchRef: HTMLElement;

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
        <section class={`search-area ${this.isOpen ? 'visible' : 'invisible'}`}>
          <i onClick={this.setIsOpen(false)}
             tooltip-content={TranslationService.translate('rdf_search.tooltips.close_search_area')}
             tooltip-placement={OntoTooltipPlacement.BOTTOM}
             data-test='onto-rdf-resource-search-close-btn'
             class="fa-light fa-xmark-large close-btn"></i>
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
        this.loadSelectedViewFromStorage();
      }
    };
  }

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
        )
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
        this.isOpen = false;
      }
    }
  }

  private focusSearchInput() {
    if (this.isOpen) {
      HtmlUtil.focusElement(`#${this.RDF_CONTEXT}`);
    }
  }

  private loadSelectedViewFromStorage() {
    const selectedView = this.resourceSearchStorageService.getSelectedView();
    if (selectedView) {
      const selectedButton = this.buttonConfig.getButtons().find((button) => button.id === selectedView);
      if (selectedButton) {
        this.buttonConfig = this.buttonConfig.selectButton(selectedButton)
      }
    }
  }
}
