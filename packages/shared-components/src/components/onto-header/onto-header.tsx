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
          <onto-repository-selector></onto-repository-selector>
          <onto-language-selector dropdown-alignment="right"></onto-language-selector>
        </div>
      </Host>
    );
  }
}
