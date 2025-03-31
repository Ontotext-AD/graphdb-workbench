import {Component, h, State} from '@stencil/core';
import {SubscriptionList} from '@ontotext/workbench-api';
import {TranslationService} from '../../services/translation.service';

@Component({
  tag: 'onto-search-icon',
  styleUrl: 'onto-search-icon.scss'
})
export class OntoSearchIcon {
  @State() private tooltipLabel: string;

  private tooltipKey: string = 'rdf_search.labels.search';
  private readonly subscriptions = new SubscriptionList();

  componentWillLoad() {
    this.onTooltipChange();
  }

  disconnectedCallback() {
    this.subscriptions.unsubscribeAll();
  }


  render() {
    return (
      <i tooltip-content={this.tooltipLabel}
         tooltip-placement="bottom"
         class="fa-light fa-magnifying-glass"></i>
    );
  }

  private onTooltipChange() {
    this.subscriptions.add(
      TranslationService.onTranslate(this.tooltipKey, [], (translation) => this.tooltipLabel = translation)
    );
  }
}
