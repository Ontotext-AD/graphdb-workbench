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
  NamespacesContextService
} from '@ontotext/workbench-api';
import {TranslationService} from '../../services/translation.service';

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

  /**
   * Button configuration for the search resource input.
   * Holds buttons to be displayed, as well as additional configuration,
   * such as whether the buttons should be treated as radio buttons.
   */
  @Prop() buttonConfig: SearchButtonConfig;

  /**
   * A trigger used to force component re-render.
   */
  @State() private updateTrigger = 0;

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
                   type="text"
                   placeholder={`${TranslationService.translate('rdf_search.labels.search')}...`}
                   ref={(ref) => this.inputRef = ref}
                   onInput={this.handleInput()}/>
            {this.inputValue?.length ?
              <i onClick={this.clearInput()}
                 tooltip-content={TranslationService.translate('rdf_search.tooltips.clear')}
                 tooltip-placement="bottom"
                 class="fa-light fa-xmark"></i> : ''
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
               onClick={this.selectSuggestion(suggestion)}
               onMouseEnter={this.hoverSuggestion(suggestion)}
               class={`${suggestion.isHovered() ? 'hovered' : ''} ${suggestion.isSelected() ? 'selected': ''}`}
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
    return () => {
      if (this.buttonConfig.isRadio && !button.selected) {
        this.buttonConfig.deselectAll();
        button.selected = true;
        this.updateView();
      }
      button.callback();
    };
  }

  /**
   * Triggers a re-render of the component by incrementing the update trigger.
   */
  private updateView() {
    this.updateTrigger++;
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
          searchResult.hoverFirstSuggestion();
          this.searchResult = searchResult;
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

  private hoverSuggestion(hoveredSuggestion: Suggestion) {
    return () => {
      this.searchResult.hoverSuggestion(hoveredSuggestion);
      this.updateView();
    };
  }

  private onAutocompleteEnabledChange() {
    this.isAutocompleteEnabled = this.autocompleteStorageService.isEnabled();
    this.subscriptions.add(
      this.autocompleteContextService.onAutocompleteEnabledChanged((enabled) => {
        if (enabled != undefined) {
          this.isAutocompleteEnabled = enabled;
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

  private selectSuggestion(suggestion: Suggestion) {
    return () => {
      if (suggestion.getType() === SuggestionType.PREFIX) {
        this.expandPrefix(suggestion);
      } else {
        this.notifySuggestionSelected(suggestion);
      }
    };
  }

  private notifySuggestionSelected(suggestion: Suggestion) {
    this.searchResult.selectSuggestion(suggestion);
    this.eventService.emit({
      NAME: SUGGESTION_SELECTED_EVENT,
      payload: new SuggestionSelectedPayload(suggestion, this.context)
    });
    this.updateView();
  }

  private expandPrefix(suggestion: Suggestion) {
    this.setInputValue(this.namespaces.getByPrefix(suggestion.getValue()));
    this.inputRef.focus();
  }

  private setInputValue(value: string) {
    this.inputValue = value;
    this.loadAutocompleteResults();
    this.updateView();
  }

  private onNamespaceChange() {
    this.subscriptions.add(
      this.namespaceContextService.onNamespacesChanged((namespaces) => {
        this.namespaces = namespaces
      })
    )
  }
}
