import { Component, Host, h } from '@stencil/core';

@Component({
  tag: 'onto-header',
  styleUrl: 'onto-header.scss',
  shadow: false,
})
export class OntoHeader {
  render() {
    return (
      <Host>
        <div class="header-component">
          <div class="search-component">&#x1F50D;</div>
          <div class="repository-selector-component">TestRepo &#8964;</div>
          <div class="language-selector-component">EN &#8964;</div>
        </div>
      </Host>
    );
  }
}