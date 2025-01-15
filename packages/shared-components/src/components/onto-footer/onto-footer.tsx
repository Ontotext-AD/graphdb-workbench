import { Component, Host, h, State } from '@stencil/core';
import { ProductInfo, ServiceProvider, SubscriptionList, ProductInfoContextService } from '@ontotext/workbench-api';

/**
 * OntoFooter component for rendering the footer of the application.
 * This component displays information about GraphDB, RDF4J, Connectors, and Workbench versions,
 * as well as copyright information.
 */
@Component({
  tag: 'onto-footer',
  styleUrl: 'onto-footer.scss',
  shadow: false,
})
export class OntoFooter {
  /** State variable to store product information */
  @State() private productInfo: ProductInfo;

  /** List of subscriptions to manage component lifecycle */
  private readonly subscriptions: SubscriptionList = new SubscriptionList();

  /** Current year for copyright display */
  private readonly currentYear = new Date().getFullYear();

  /**
   * Sets up a subscription to product info changes.
   */
  componentWillLoad(): void {
    this.subscriptions.add(ServiceProvider.get(ProductInfoContextService)
      .onProductInfoChanged(productInfo => {
        this.productInfo = productInfo;
      }));
  }

  render() {
    return (
      <Host>
        <div class="footer-component">
          <a href="http://graphdb.ontotext.com" target="_blank"
             rel="noopener noreferrer">GraphDB</a>&nbsp;{this.productInfo?.productVersion} &bull;&nbsp;<a
          href="http://rdf4j.org" target="_blank" rel="noopener noreferrer">RDF4J&nbsp;</a
          >{this.productInfo?.sesame} &bull; Connectors {this.productInfo?.connectors} &bull; Workbench {this.productInfo?.workbench} &bull; &copy;
          2002&ndash;{this.currentYear}&nbsp;<a href="http://ontotext.com" target="_blank" rel="noopener noreferrer">Ontotext
          AD</a>.&nbsp;<translate-label labelKey={'footer.label.all_rights_reserved'}></translate-label>
        </div>
      </Host>
    );
  }

  /**
   * Lifecycle method called when the component is about to be removed from the DOM.
   * Unsubscribes from all subscriptions to prevent memory leaks.
   */
  disconnectedCallback(): void {
    this.subscriptions.unsubscribeAll();
  }
}
