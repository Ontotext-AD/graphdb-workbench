import { Component, Host, h } from '@stencil/core';

@Component({
  tag: 'onto-footer',
  styleUrl: 'onto-footer.scss',
  shadow: false,
})
export class OntoFooter {
  render() {
    return (
      <Host>
        <div class="footer-component">
          <a href="http://graphdb.ontotext.com" target="_blank" rel="noopener noreferrer">GraphDB</a> 10.7.0
          &bull; <a
          href="http://rdf4j.org" target="_blank" rel="noopener noreferrer">RDF4J</a> 4.3.10 &bull; Connectors
          16.2.8 &bull; Workbench 2.7.0 &bull; &copy;
          2002&ndash;2024 <a href="http://ontotext.com" target="_blank" rel="noopener noreferrer">Ontotext
          AD</a>. All rights reserved.
        </div>
      </Host>
    );
  }
}
