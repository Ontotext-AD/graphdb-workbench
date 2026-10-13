import {Component, Host, h, State, Listen, FunctionalComponent} from '@stencil/core';
import {
  ProductInfo,
  service,
  SubscriptionList,
  ProductInfoContextService,
  SecurityContextService,
  TrackingService,
  LicenseContextService,
  WindowService
} from '@ontotext/workbench-api';

/**
 * A link, which opens in a new window and tells it with an icon and a text for screen readers.
 */
const ExternalLink: FunctionalComponent<{href: string}> = ({href}, children) => (
  <a href={href} target="_blank" rel="noopener noreferrer">
    {children}
    <i class="ri-external-link-line" aria-hidden="true"></i>
    <span class="screen-reader-only"> <translate-label labelKey={'common.label.opens_in_new_window'}></translate-label></span>
  </a>
);

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
      .then(() => {
        this.shouldShowCookieConsent = false;
        // Trigger a resize event so the layout can recalculate the navbar height now that the cookie banner is removed.
        WindowService.getWindow().dispatchEvent(new Event('resize'));
      });
  }

  render() {
    return (
      <Host>
        <div class="footer-component">
          <ExternalLink href="http://graphdb.ontotext.com">GraphDB</ExternalLink>&nbsp;{this.productInfo?.productVersion} &bull;&nbsp;<ExternalLink
            href="http://rdf4j.org">RDF4J</ExternalLink
          >&nbsp;{this.productInfo?.sesame} &bull; Connectors {this.productInfo?.connectors} &bull; Ontop {this.productInfo?.ontop} &bull; Workbench {this.productInfo?.workbench} &bull; &copy;
          2002&ndash;{this.currentYear}&nbsp;<ExternalLink href="http://ontotext.com">Ontotext
          AD</ExternalLink>.&nbsp;<translate-label labelKey={'footer.label.all_rights_reserved'}></translate-label>
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
    this.subscribeToSecurityConfigChange();
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

  private subscribeToSecurityConfigChange(): void {
    this.subscriptions.add(
      this.securityContextService.onSecurityConfigChanged(() => {
        this.setCookieConsentVisibility();
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
    // The security config may not be loaded yet, e.g. when the component connects before the security bootstrap has
    // finished. Visibility will be recalculated by the security config subscription once the config is available.
    if (!this.securityContextService.getSecurityConfig()) {
      this.shouldShowCookieConsent = false;
      return;
    }

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
