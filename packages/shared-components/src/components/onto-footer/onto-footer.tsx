import {Component, Host, h, State, Listen} from '@stencil/core';
import {
  ProductInfo,
  ServiceProvider,
  SubscriptionList,
  ProductInfoContextService,
  LicenseService,
  SecurityContextService,
  CookieConsent,
  CookieService, LicenseContextService, WindowService
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

  private readonly securityContextService: SecurityContextService = ServiceProvider.get(SecurityContextService);
  private readonly licenseContextService: LicenseContextService = ServiceProvider.get(LicenseContextService);
  private readonly cookieService = ServiceProvider.get(CookieService);

  @Listen('consentGiven')
  handleConsentGiven(): void {
    this.cookieService.acceptCookiePolicy()
      .then(() => this.shouldShowCookieConsent = false);
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
  }

  disconnectedCallback(): void {
    this.subscriptions.unsubscribeAll();
  }

  private subscribeToProductInfoChange() {
    this.subscriptions.add(ServiceProvider.get(ProductInfoContextService)
      .onProductInfoChanged(productInfo => {
        this.productInfo = productInfo;
      }));
  }

  private isTrackingAllowed(): boolean {
    return ServiceProvider.get(LicenseService).isTrackableLicense() && !WindowService.isDevMode();
  }

  private subscribeToUserChange(): void {
    // TODO: move to cookieService, when the authenticatedUser is available synchronously
    this.subscriptions.add(
      this.securityContextService.onAuthenticatedUserChanged(() => {
        this.setCookieConsentVisibility();
      }));
  }

  private setCookieConsentVisibility() {
    const user = this.securityContextService.getAuthenticatedUser();
    this.shouldShowCookieConsent = this.isTrackingAllowed() && !new CookieConsent(user?.appSettings?.COOKIE_CONSENT).policyAccepted;
  }

  private subscribeToLicenseChange() {
    this.subscriptions.add(
      this.licenseContextService.onLicenseChanged(() => {
        this.setCookieConsentVisibility();
      })
    )
  }
}
