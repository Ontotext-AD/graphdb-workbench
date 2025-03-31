import {SearchButton, SearchButtonConfig, SearchViewType, SubscriptionList} from '@ontotext/workbench-api';
import {Component, h, Listen, State} from '@stencil/core';
import {TranslationService} from '../../services/translation.service';

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

  @State() private isOpen: boolean = false;

  @State() private buttonConfig: SearchButtonConfig;

  private searchViewType: SearchViewType = SearchViewType.TABLE;
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

  componentWillLoad() {
    // Temporary not to break build, since it is unused
    console.log(this.searchViewType);
  }

  disconnectedCallback() {
    this.subscriptions.unsubscribeAll();
  }

  render() {
    return (
      <section ref={(ref) => this.rdfSearchRef = ref} class="onto-rdf-search">
        <section class={`search-area ${this.isOpen ? 'visible' : 'invisible'}`}>
          <i onClick={this.setIsOpen(false)}
             tooltip-content={TranslationService.translate('rdf_search.tooltips.close_search_area')}
             tooltip-placement="bottom"
             class="fa-light fa-xmark-large close-btn"></i>
          <onto-search-resource-input buttonConfig={this.buttonConfig}></onto-search-resource-input>
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
      if (isOpen) {
        this.buttonConfig = this.createButtonConfig();
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
          'rdf_search.buttons.table',
          () => {
            this.searchViewType = SearchViewType.TABLE;
          },
          true
        ),
        this.createSearchButton(
          'rdf_search.buttons.visual',
          () => {
            this.searchViewType = SearchViewType.VISUAL;
          },
          false
        )
      ]
    });
  }

  /**
   * Creates a search button with the given parameters.
   * @param labelKey - The key for the button's label translation.
   * @param callback - The function to be called when the button is clicked.
   * @param selected - Boolean indicating whether the button should be initially selected.
   * @returns A SearchButton object.
   */
  private createSearchButton(labelKey: string, callback: () => void, selected: boolean): SearchButton {
    return new SearchButton({
      label: TranslationService.translate(labelKey),
      callback,
      selected
    } as SearchButton);
  }
}
