import {Component, Host, h, State, Listen} from '@stencil/core';
import {
  ProductInfo,
  service,
  SubscriptionList,
  ProductInfoContextService,
  SecurityContextService,
  TrackingService,
  LicenseContextService,
} from '@ontotext/workbench-api';

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

  /** State variable determining weather to show the cookie consent component */
  @State() private shouldShowCookieConsent: boolean;

  /** List of subscriptions to manage component lifecycle */
  private readonly subscriptions: SubscriptionList = new SubscriptionList();

  /** Current year for copyright display */
  private readonly currentYear = new Date().getFullYear();

  private readonly productInfoContextService = service(ProductInfoContextService);
  private readonly securityContextService = service(SecurityContextService);
  private readonly licenseContextService = service(LicenseContextService);
  private readonly trackingService = service(TrackingService);

  @Listen('consentGiven')
  handleConsentGiven(): void {
    this.trackingService.acceptCookiePolicy()
      .then(() => this.shouldShowCookieConsent = false);
  }

  render() {
    return (
      <Host>
        <div class="footer-component">
          <a href="http://graphdb.ontotext.com" target="_blank"
            rel="noopener noreferrer">GraphDB</a>&nbsp;{this.productInfo?.productVersion} &bull;&nbsp;<a
            href="http://rdf4j.org" target="_blank" rel="noopener noreferrer">RDF4J</a
          >&nbsp;{this.productInfo?.sesame} &bull; Connectors {this.productInfo?.connectors} &bull; Workbench {this.productInfo?.workbench} &bull; &copy;
          2002&ndash;{this.currentYear}&nbsp;<a href="http://ontotext.com" target="_blank" rel="noopener noreferrer">Ontotext
          AD</a>.&nbsp;<translate-label labelKey={'footer.label.all_rights_reserved'}></translate-label>
        </div>
        {this.shouldShowCookieConsent && <onto-cookie-consent></onto-cookie-consent>}
      </Host>
    );
  }

  // ========================
  // Lifecycle methods
  // ========================
  connectedCallback(): void {
    this.subscribeToProductInfoChange();
    this.subscribeToUserChange();
    this.subscribeToLicenseChange();
    this.subscribeToUserLoginStatusChange();
  }

  disconnectedCallback(): void {
    this.subscriptions.unsubscribeAll();
  }

  private subscribeToProductInfoChange() {
    this.subscriptions.add(this.productInfoContextService.onProductInfoChanged(
      (productInfo) => {
        this.productInfo = productInfo;
      }));
  }

  private subscribeToUserChange(): void {
    // TODO: move to cookieService, when the authenticatedUser is available synchronously
    this.subscriptions.add(
      this.securityContextService.onAuthenticatedUserChanged(() => {
        this.setCookieConsentVisibility();
      }));
  }

  private subscribeToUserLoginStatusChange(): void {
    this.subscriptions.add(
      this.securityContextService.onUserLoginStatusChanged(() => {
        this.setCookieConsentVisibility();
      }));
  }

  /**
   * Determines whether the cookie consent banner should be shown based on the user's authentication status, license
   * type, and cookie consent status.
   * The banner is shown if the user has not accepted the cookie policy and either has free access or is logged in,
   * provided that tracking is allowed by the license. Otherwise, the banner is hidden.
   */
  private setCookieConsentVisibility() {
    if (!this.trackingService.isTrackingAllowed()) {
      this.shouldShowCookieConsent = false;
      return;
    }

    const isLoggedIn = this.securityContextService.getIsLoggedIn();
    const isFreeAccessEnabled = this.securityContextService.getSecurityConfig()?.isFreeAccessEnabled() ?? false;
    const cookieConsent = this.trackingService.getCookieConsent();
    if (cookieConsent) {
      this.shouldShowCookieConsent = !cookieConsent.policyAccepted && (isFreeAccessEnabled || isLoggedIn);
    }
  }

  private subscribeToLicenseChange() {
    this.subscriptions.add(
      this.licenseContextService.onLicenseChanged(() => {
        this.setCookieConsentVisibility();
      })
    );
  }
}
