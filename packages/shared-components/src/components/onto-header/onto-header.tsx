import { Component, Host, h, State } from '@stencil/core';
import { ServiceProvider, LicenseContextService, License } from '@ontotext/workbench-api'
import { SubscriptionList } from '../../../../api/src/models/common/subscription-list';

/**
 * OntoHeader component for rendering the header of the application.
 * This component includes a search component, license alert (if applicable),
 * repository selector, and language selector.
 */
@Component({
  tag: 'onto-header',
  styleUrl: 'onto-header.scss',
  shadow: false,
})
export class OntoHeader {
  /** The current license information */
  @State() private license: License;

  /** Array of subscription cleanup functions */
  private readonly subscriptions: SubscriptionList = new SubscriptionList();

  /**
   * Initializes the component and sets up license change subscription.
   */
  constructor() {
    this.subscriptions.add(ServiceProvider.get(LicenseContextService)
      .onLicenseChanged(license => {
        this.license = license;
      }));
  }

  render() {
    return (
      <Host>
        <div class="header-component">
          <div class="search-component">&#x1F50D;</div>
          {Boolean(this.license) && !this.license?.valid ?
            <onto-license-alert license={this.license}></onto-license-alert> : ''
          }
          <onto-repository-selector></onto-repository-selector>
          <onto-language-selector dropdown-alignment="right"></onto-language-selector>
        </div>
      </Host>
    );
  }

  /**
   * Lifecycle method called when the component is about to be removed from the DOM.
   * Cleans up all subscriptions.
   */
  disconnectedCallback(): void {
    this.subscriptions.unsubscribeAll();
  }
}
