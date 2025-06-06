import {Component, h, State} from '@stencil/core';
import {SubscriptionList} from '@ontotext/workbench-api';
import {TranslationService} from '../../services/translation.service';
import {OntoTooltipPlacement} from "../onto-tooltip/models/onto-tooltip-placement";

@Component({
  tag: 'onto-search-icon',
  styleUrl: 'onto-search-icon.scss',
  scoped: true
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
    return (
      <i tooltip-content={this.tooltipLabel}
         tooltip-placement={OntoTooltipPlacement.BOTTOM}
         class="fa-light fa-magnifying-glass"></i>
    );
  }

  private onTooltipChange() {
    this.subscriptions.add(
      TranslationService.onTranslate(this.tooltipKey, [], (translation) => this.tooltipLabel = translation)
    );
  }
}
