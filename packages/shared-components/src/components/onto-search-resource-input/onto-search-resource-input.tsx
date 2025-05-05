import {Component, h, Prop, State} from '@stencil/core';
import {
  AutocompleteContextService,
  AutocompleteSearchResult,
  AutocompleteService,
  AutocompleteStorageService,
  EventService,
  NamespaceMap,
  navigateTo,
  OntoToastrService,
  SearchButton,
  SearchButtonConfig,
  ServiceProvider,
  SubscriptionList,
  Suggestion,
  SUGGESTION_SELECTED_EVENT,
  SuggestionSelectedPayload,
  SuggestionType,
  NamespacesContextService,
  UriUtil
} from '@ontotext/workbench-api';
import {TranslationService} from '../../services/translation.service';
import {HtmlUtil} from '../../utils/html-util';

/**
 * A component for rendering RDF search resource input with configurable buttons.
 * This component provides a text input for search queries and a set of configurable buttons.
 */
@Component({
  tag: 'onto-search-resource-input',
  styleUrl: 'onto-search-resource-input.scss'
})
export class OntoSearchResourceInput {
  private readonly autocompleteService = ServiceProvider.get(AutocompleteService);
  private readonly autocompleteContextService = ServiceProvider.get(AutocompleteContextService);
  private readonly autocompleteStorageService = ServiceProvider.get(AutocompleteStorageService);
  private readonly toastrService = ServiceProvider.get(OntoToastrService);
  private readonly eventService = ServiceProvider.get(EventService);
  private readonly namespaceContextService = ServiceProvider.get(NamespacesContextService);

  private readonly subscriptions = new SubscriptionList();
  private autocompleteWarningShown = false;
  private inputRef: HTMLInputElement;
  private namespaces: NamespaceMap;

  /**
   * The search resource component can appear more than once per page. This context
   * is used to differentiate them. When a suggestion is selected different parents
   * may need to do different things. The context is emitted alongside the suggestion
   * upon select.
   */
  @Prop() context: string;

  /** Whether the rdf resource pre-search validation should be skipped. */
  @Prop() skipValidation = false;

  /**
   * Button configuration for the search resource input.
   * Holds buttons to be displayed, as well as additional configuration,
   * such as whether the buttons should be treated as radio buttons.
   */
  @Prop() buttonConfig: SearchButtonConfig;

  /**
   * The current value of the search input field.
   */
  @State() private inputValue: string;

  /**
   * The current autocomplete search result
   */
  @State() private searchResult: AutocompleteSearchResult;

  /**
   * Whether the autocomplete setting is enabled.
   */
  @State() private isAutocompleteEnabled = true;

  componentWillLoad() {
    this.onAutocompleteEnabledChange();
    this.onNamespaceChange();
  }

  disconnectedCallback() {
    this.subscriptions.unsubscribeAll();
  }

  render() {
    return (
      <section class="search-resources-input">
        <div class="input-row">
          <span class="input-wrapper">
            <input value={this.inputValue}
                   id={this.context}
                   type="text"
                   autocomplete="off"
                   placeholder={`${TranslationService.translate('rdf_search.labels.search')}...`}
                   ref={(ref) => this.inputRef = ref}
                   onKeyDown={this.onKeyDown()}
                   onInput={this.handleInput()}/>
            {this.inputValue?.length ?
              <i onClick={this.clearInput()}
                 tooltip-content={TranslationService.translate('rdf_search.tooltips.clear')}
                 tooltip-placement="bottom"
                 class="fa-light fa-xmark clear-input"></i> : ''
            }
          </span>
          {this.buttonConfig?.getButtons().getItems().map((button) => (
            <button key={button.label}
                    onClick={this.handleButtonClick(button)}
                    class={`${button.selected ? 'selected' : ''}`}>{button.label}</button>
          ))}
        </div>
        <span class="hint">{TranslationService.translate('rdf_search.labels.hint')}</span>
        <section class="autocomplete-results-wrapper">
          {this.searchResult?.getSuggestions().getItems().map((suggestion) => (
            <p key={suggestion.getId()}
               onClick={this.onSuggestionClick(suggestion)}
               onMouseEnter={this.hoverSuggestion(suggestion)}
               class={`${suggestion.isHovered() ? 'hovered' : ''} ${suggestion.isSelected() ? 'selected' : ''}`}
               innerHTML={suggestion.getDescription()}></p>
          ))}
        </section>
      </section>
    );
  }

  /**
   * Handles the click event for a search button.
   * If the button configuration is set to radio mode and the clicked button is not selected,
   * it deselects all other buttons and selects the clicked one.
   * @param {SearchButton} button - The button that was clicked.
   */
  private handleButtonClick(button: SearchButton) {
    return () => this.buttonConfig = this.buttonConfig.selectButton(button);
  }

  /**
   * Updates the local inputValue with the html input element's value.'
   */
  private handleInput() {
    return (event: Event) => {
      const target = event.target as HTMLInputElement;
      this.setInputValue(target.value);
      this.checkForAutocomplete();
    };
  }

  private loadAutocompleteResults() {
    if (this.isAutocompleteEnabled) {
      this.autocompleteService.search(this.inputValue)
        .then((searchResult) => {
          this.searchResult = searchResult.hoverFirstSuggestion();
        });
    }
  }

  /**
   * Clears the search input field.
   */
  private clearInput() {
    return () => {
      this.setInputValue('');
    };
  }

  private hoverSuggestion(suggestion: Suggestion) {
    return () =>  this.searchResult = this.searchResult.hoverSuggestion(suggestion);
  }

  private onAutocompleteEnabledChange() {
    this.isAutocompleteEnabled = this.autocompleteStorageService.isEnabled();
    this.subscriptions.add(
      this.autocompleteContextService.onAutocompleteEnabledChanged((enabled) => {
        if (enabled != undefined) {
          this.isAutocompleteEnabled = enabled;
        }
        if (!this.isAutocompleteEnabled) {
          this.searchResult = this.searchResult?.clearSuggestions();
        }
      })
    );
  }

  private checkForAutocomplete() {
    if (this.inputValue.length > 0 && !this.isAutocompleteEnabled && !this.autocompleteWarningShown) {
      this.autocompleteWarningShown = true;
      const message = TranslationService.translate('rdf_search.toasts.autocomplete_is_off');
      this.toastrService.warning(`<a style="font-weight: 500">${message}</a>`,
        {
          onClick: navigateTo('/autocomplete'),
          removeOnClick: true
        });
    }
  }

  private onSuggestionClick(suggestion: Suggestion) {
    return (event: MouseEvent) => {
      suggestion.setOverrideToVisual(event.ctrlKey || event.metaKey);
      this.searchRdfResource(suggestion);
    };
  }

  private searchRdfResource(suggestion: Suggestion) {
    if (suggestion.getType() === SuggestionType.PREFIX) {
      this.expandPrefix(suggestion);
    } else {
      this.notifyRdfResourceSelected(suggestion);
    }
  }

  private notifyRdfResourceSelected(suggestion: Suggestion) {
    this.searchResult = this.searchResult?.selectSuggestion(suggestion);
    this.eventService.emit({
      NAME: SUGGESTION_SELECTED_EVENT,
      payload: new SuggestionSelectedPayload(suggestion, this.context)
    });
  }

  private expandPrefix(suggestion: Suggestion) {
    this.setInputValue(this.namespaces.getByPrefix(suggestion.getValue()));
    this.inputRef.focus();
  }

  private setInputValue(value: string) {
    this.inputValue = value;
    this.loadAutocompleteResults();
  }

  private onNamespaceChange() {
    this.subscriptions.add(
      this.namespaceContextService.onNamespacesChanged((namespaces) => {
        this.namespaces = namespaces;
      })
    );
  }

  private onKeyDown() {
    return (event: KeyboardEvent) => {
      switch (event.key) {
        case 'Enter':
          this.onEnter(event);
          break;
        case 'Escape':
          this.onEscape();
          break;
        case 'ArrowUp':
          this.onArrowUp(event);
          break;
        case 'ArrowDown':
          this.onArrowDown(event);
          break;
        default:
          break;
      }
    };
  }

  private onEnter(event: KeyboardEvent) {
    let selectedSuggestion = this.searchResult?.getHoveredSuggestion();
    if (!selectedSuggestion) {
      selectedSuggestion = new Suggestion({
        value: UriUtil.removeAngleBrackets(this.inputValue),
        type: SuggestionType.URI
      });
    }
    selectedSuggestion.setOverrideToVisual(event.ctrlKey || event.metaKey);
    this.validateAndSearch(selectedSuggestion);
  }

  private onArrowUp(event: KeyboardEvent) {
    this.searchResult = this.searchResult.hoverPreviousSuggestion();
    this.displaySuggestion(event);
  }

  private onArrowDown(event: KeyboardEvent) {
    this.searchResult = this.searchResult.hoverNextSuggestion();
    this.displaySuggestion(event);
  }

  private displaySuggestion(event: KeyboardEvent) {
    event.preventDefault();
    // Update the input directly, because the value should only be displayed,
    // without triggering a new search and altering the autocomplete results
    this.inputRef.value = this.searchResult.getHoveredSuggestion().getValue();
    // The view needs to be updated before scrolling to the hovered suggestion.
    // Otherwise, the next/previous suggestion does not have the 'hovered' class applied yet
    // and this leads to unexpected behavior.
    setTimeout(() => {
      HtmlUtil.scrollElementIntoView('.hovered');
    })
  }

  private validateAndSearch(suggestion: Suggestion) {
    if (!this.skipValidation) {
      if (!suggestion.getValue()) {
        this.toastrService.error(TranslationService.translate('rdf_search.toasts.empty_input'));
        return;
      }

      if (!UriUtil.isValidUri(suggestion.getValue())) {
        this.toastrService.error(TranslationService.translate('rdf_search.toasts.invalid_uri'));
        return;
      }
    }

    this.searchRdfResource(suggestion);
  }

  private onEscape() {
    // TODO: Input shouldn't be cleared if preserveSearch is enabled
    this.setInputValue('');
  }
}
