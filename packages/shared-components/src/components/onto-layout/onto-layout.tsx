import {Component, Host, h, Listen, Element, State} from '@stencil/core';
import {NavbarToggledEvent} from "../onto-navbar/navbar-toggled-event";
import {debounce} from "../../utils/function-utils";
import {WINDOW_WIDTH_FOR_COLLAPSED_NAVBAR} from "../../models/constants";
import {
  ServiceProvider,
  LocalStorageSubscriptionHandlerService,
  SecurityContextService,
  RestrictedPages,
  EventService,
  EventName,
  SubscriptionList,
  AuthenticatedUser,
  SecurityConfig,
  Authority,
  AuthenticationService
} from '@ontotext/workbench-api';
import {ExternalMenuItemModel} from '../onto-navbar/external-menu-model';

@Component({
  tag: 'onto-layout',
  styleUrl: 'onto-layout.scss',
  shadow: false,
})
export class OntoLayout {
  private windowResizeObserver: (...args: any) => void;
  private securityContextService = ServiceProvider.get(SecurityContextService);
  /**
   * List of subscriptions to manage component lifecycle
   * */
  private readonly subscriptions: SubscriptionList = new SubscriptionList();
  private isNavbarCollapsed = false;

  /**
   * The current authenticated user
   */
  private authenticatedUser: AuthenticatedUser;

  /**
   * The security configuration.
   */
  private securityConfig: SecurityConfig;

  /**
   * The current route. This is used to highlight the selected menu item in the navbar.
   */
  private currentRoute: string;
  private navbarRef: HTMLOntoNavbarElement;

  constructor() {
    this.windowResizeObserver = debounce(() => this.windowResizeHandler(), 50);
  }

  @Element() hostElement: HTMLOntoLayoutElement;

  @State() isLowResolution = false;
  @State() hasPermission: boolean = true;
  @State() showFooter = this.isAuthenticatedFully();

  /**
   * Event listener for the navbar toggled event. The layout needs to respond properly when the navbar is toggled in
   * order to fit the content.
   * @param event
   */
  @Listen('navbarToggled')
  onNavbarToggled(event: CustomEvent<NavbarToggledEvent>) {
    this.isNavbarCollapsed = event.detail.payload;
    if (this.isNavbarCollapsed) {
      this.hostElement.classList.add('expanded');
    } else {
      this.hostElement.classList.remove('expanded');
    }
  }

  /**
   * Event listener for window resize event. We need to handle this in order to allow the navbar to collapse when the
   * window is resized.
   */
  @Listen('resize', {target: 'window'})
  onResize() {
    this.windowResizeObserver();
  }

  private windowResizeHandler(): void {
    this.isLowResolution = window.innerWidth <= WINDOW_WIDTH_FOR_COLLAPSED_NAVBAR;
    if (!this.isLowResolution && !this.isNavbarCollapsed) {
      this.hostElement.classList.remove('expanded');
    } else {
      this.hostElement.classList.add('expanded');
    }
  }

  private handleStorageChange(event: StorageEvent) {
    const service = ServiceProvider.get(LocalStorageSubscriptionHandlerService);
    service.handleStorageChange(event);
  }

  private setPermission(permissions: RestrictedPages) {
    if (permissions) {
      const path = location.pathname;
      this.hasPermission = !permissions.isRestricted(path);
    } else {
      // If the permissions are undefined, the user can access the url
      this.hasPermission = true;
    }

    const mainContent = document.querySelector('.wb-layout main') as HTMLElement;
    if (mainContent) {
      mainContent.style.display = this.hasPermission ? 'block' : 'none';
    }
  }

  private onSecurityChanged() {
    const securityContextService = ServiceProvider.get(SecurityContextService);
    this.subscriptions.add(
      securityContextService.onAuthenticatedUserChanged((authenticatedUser) => {
        this.authenticatedUser = authenticatedUser;
        this.setNavbarItemVisibility();
        this.showFooter = this.isAuthenticatedFully();
      })
    );

    this.subscriptions.add(
      securityContextService.onSecurityConfigChanged((securityConfig) => {
        this.securityConfig = securityConfig;
        this.setNavbarItemVisibility();
        this.showFooter = this.isAuthenticatedFully();
      })
    );
  }

  private shouldShowMenu(role: Authority): boolean {
    return this.isAuthenticatedFully()
      && ServiceProvider.get(AuthenticationService).hasRole(role, this.securityConfig, this.authenticatedUser);
  }

  private isAuthenticatedFully() {
    const authService = ServiceProvider.get(AuthenticationService);
    return authService.isAuthenticated(this.securityConfig, this.authenticatedUser)
      || authService.hasFreeAccess(this.securityConfig);
  }

  private setNavbarItemVisibility() {
    if (!this.navbarRef?.menuItems) {
      return;
    }
    // recursively check for children and set their shouldShow property
    const processItem = (item: ExternalMenuItemModel) => {
      item.shouldShow = this.shouldShowMenu(item.role as Authority);
      if (item.children?.length) {
        item.children.forEach(processItem);
      }
    };

    this.navbarRef?.menuItems?.forEach(plugin => {
      plugin.items.forEach(processItem);
    });
    // Update the reference to trigger a re-render
    this.navbarRef.menuItems = [...this.navbarRef.menuItems];
  }

  // ========================
  // Lifecycle methods
  // ========================

  componentDidLoad() {
    this.windowResizeHandler();
  }

  componentWillLoad() {
    let route = window.location.pathname;
    this.currentRoute  = route.replace('/', '').split('/')[0];
    window.addEventListener("storage", this.handleStorageChange);
    this.onSecurityChanged();
  }

  connectedCallback() {
    // Subscribing here, because after a disconnectedCallback the connectedCallback is called, instead of componentDidLoad or constructor
    this.subscriptions.add(this.securityContextService.onRestrictedPagesChanged((restrictedPages) => this.setPermission(restrictedPages)));
    this.subscriptions.add(ServiceProvider.get(EventService).subscribe(EventName.NAVIGATION_END, () => this.setPermission(this.securityContextService.getRestrictedPages())));
    this.setPermission(this.securityContextService.getRestrictedPages());
  }

  /**
   * Lifecycle method called when the component is about to be removed from the DOM.
   * Unsubscribes from all subscriptions to prevent memory leaks.
   */
  disconnectedCallback() {
    window.removeEventListener("storage", this.handleStorageChange);
    this.subscriptions.unsubscribeAll();
  }

  render() {
    return (
      <Host class="wb-layout">
        {/* Default slot is explicitly defined to be able to hide the main content in the user permission check */}
        <div class="default-slot-wrapper">
          <slot name="default"></slot>
        </div>
        <header class="wb-header">
          {this.isAuthenticatedFully() && <onto-header></onto-header>}
        </header>

        <nav class="wb-navbar">
          <onto-navbar ref={(navbar) => this.navbarRef = navbar}
                       navbar-collapsed={this.isLowResolution}
                       selected-menu={this.currentRoute}></onto-navbar>
        </nav>

        {this.hasPermission ? (
          <div class='main-slot-wrapper'>
            <slot name="main"></slot></div>
            ) : (
            <onto-permission-banner></onto-permission-banner>
            )}
        <footer class="wb-footer">
          <onto-footer></onto-footer>
        </footer>
        <onto-tooltip></onto-tooltip>
      </Host>
    );
  }
}
