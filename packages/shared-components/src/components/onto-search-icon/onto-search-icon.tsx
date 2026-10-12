import {Component, h, State} from '@stencil/core';
import {SubscriptionList} from '@ontotext/workbench-api';
import {TranslationService} from '../../services/translation.service';
import {OntoTooltipPlacement} from '../onto-tooltip/models/onto-tooltip-placement';

@Component({
  tag: 'onto-search-icon',
  styleUrl: 'onto-search-icon.scss'
})
export class OntoSearchIcon {
  @State() private tooltipLabel: string;

  private readonly tooltipKey: string = 'rdf_search.labels.search';
  private readonly subscriptions = new SubscriptionList();

  // ========================
  // Lifecycle methods
  // ========================
  connectedCallback() {
    this.onTooltipChange();
  }

  disconnectedCallback() {
    this.subscriptions.unsubscribeAll();
  }

  render() {
    // The click handler is set on the host by the parent component; the click of the button bubbles to it.
    return (
      <button type="button"
        class="onto-search-icon"
        aria-label={this.tooltipLabel}
        tooltip-content={this.tooltipLabel}
        tooltip-placement={OntoTooltipPlacement.BOTTOM}>
        <i class="ri-search-line ri-lg" aria-hidden="true"></i>
      </button>
    );
  }

  private onTooltipChange() {
    this.subscriptions.add(
      TranslationService.onTranslate(this.tooltipKey, [], (translation) => this.tooltipLabel = translation)
    );
  }
}
