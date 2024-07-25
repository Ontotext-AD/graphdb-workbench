import { Component, Host, h } from '@stencil/core';
import {WorkbenchServiceProvider, WorkbenchEventService, WorkbenchEventType} from "@ontotext/workbench-api";

@Component({
  tag: 'onto-header',
  styleUrl: 'onto-header.scss',
  shadow: false,
})
export class OntoHeader {

  private eventService: WorkbenchEventService;

  private locale = 'en'

  constructor() {
    this.eventService = WorkbenchServiceProvider.get(WorkbenchEventService);
  }

  private onClick(): void {
    // TODO remove this when implement language selector
    if (this.locale === 'en') {
      this.locale = 'fr';
    } else {
      this.locale = 'en';
    }
    this.eventService.emit({NAME: WorkbenchEventType.LANGUAGE_CHANGED, payload: {locale: this.locale}})
  }


  render() {
    return (
      <Host>
        <div class="header-component">
          <div class="search-component">&#x1F50D;</div>
          <div class="repository-selector-component">TestRepo &#8964;</div>
          <div class="language-selector-component" onClick={() => this.onClick()}>EN &#8964;</div>
        </div>
      </Host>
    );
  }
}
