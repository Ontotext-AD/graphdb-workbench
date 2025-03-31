import {Component, h, Prop, State} from '@stencil/core';
import {SearchButton, SearchButtonConfig} from '@ontotext/workbench-api';
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

  render() {
    return (
      <section class="search-resources-input">
        <div class="input-row">
          <span class="input-wrapper">
            <input value={this.inputValue}
                   type="text"
                   placeholder={`${TranslationService.translate('rdf_search.labels.search')}...`}
                   onInput={this.handleInput()}/>
            {this.inputValue?.length ?
              <i onClick={this.clearInput()}
                 tooltip-content={TranslationService.translate('rdf_search.tooltips.clear')}
                 tooltip-placement="bottom"
                 class="fa-light fa-xmark"></i> : ''
            }
          </span>
          {this.buttonConfig?.buttons.getItems().map((button) => (
            <button key={button.label}
                    onClick={this.handleButtonClick(button)}
                    class={`${button.selected ? 'selected' : ''}`}>{button.label}</button>
          ))}

        </div>
        <span class="hint">{TranslationService.translate('rdf_search.labels.hint')}</span>
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
        this.deselectAllButtons();
        button.selected = true;
        this.updateView();
      }
      button.callback();
    };
  }

  private deselectAllButtons() {
    this.buttonConfig.buttons.getItems().forEach((btn) => btn.selected = false);
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
      this.inputValue = target.value;
    };
  }

  /**
   * Clears the search input field.
   */
  private clearInput() {
    return () => {
      this.inputValue = '';
    };
  }
}
