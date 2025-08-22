import {Component, Host, h, Listen, Element, State} from '@stencil/core';
import {NavbarToggledEvent} from '../onto-navbar/navbar-toggled-event';
import {debounce} from '../../utils/function-utils';
import {WINDOW_WIDTH_FOR_COLLAPSED_NAVBAR} from '../../models/constants';
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
  AuthenticationService, NavigationEndPayload, NavigationContextService, getPathName, WindowService,
} from '@ontotext/workbench-api';
import {ExternalMenuItemModel} from '../onto-navbar/external-menu-model';

@Component({
  tag: 'onto-layout',
  styleUrl: 'onto-layout.scss',
  shadow: false,
})
export class OntoLayout {
  // ========================
  // Services
  // ========================
  private readonly securityContextService = ServiceProvider.get(SecurityContextService);
  private readonly authenticationService = ServiceProvider.get(AuthenticationService);
  private readonly navigationContextService = ServiceProvider.get(NavigationContextService);

  // ========================
  // DOM Refs
  // ========================
  @Element() hostElement: HTMLOntoLayoutElement;
  private navbarRef: HTMLOntoNavbarElement;

  // ========================
  // State
  // ========================
  @State() authenticatedUser: AuthenticatedUser;
  @State() authToken: string | null;
  @State() securityConfig: SecurityConfig;
  @State() isLowResolution = false;
  @State() hasPermission = true;
  @State() showFooter = this.isAuthenticatedFully();
  @State() isVisible: boolean;

  // ========================
  // Private
  // ========================
  /**
   * List of subscriptions to manage component lifecycle
   * */
  private readonly subscriptions: SubscriptionList = new SubscriptionList();
  private readonly windowResizeObserver: () => void;
  private isNavbarCollapsed = false;

  // ========================
  // Lifecycle methods
  // ========================
  constructor() {
    this.windowResizeObserver = debounce(() => this.windowResizeHandler(), 50);
    WindowService.getWindow().addEventListener('storage', this.handleStorageChange);
  }

  componentDidLoad() {
    this.windowResizeHandler();
  }

  connectedCallback() {
    this.subscribeToSecurityChanges();
    this.updateVisibility();
    // Subscribing here, because after a disconnectedCallback the connectedCallback is called, instead of componentDidLoad or constructor
    this.subscriptions.add(this.securityContextService.onRestrictedPagesChanged((restrictedPages) => this.setPermission(restrictedPages)));
    this.subscriptions.add(
      ServiceProvider.get(EventService).subscribe(EventName.NAVIGATION_END, (navigationEndPayload: NavigationEndPayload) => {
        this.navigationContextService.updatePreviousRoute(navigationEndPayload.oldUrl);
        this.setPermission(this.securityContextService.getRestrictedPages());
      }));
    this.setPermission(this.securityContextService.getRestrictedPages());
  }

  /**
   * Lifecycle method called when the component is about to be removed from the DOM.
   * Unsubscribes from all subscriptions to prevent memory leaks.
   */
  disconnectedCallback() {
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
          {this.isVisible && <onto-header></onto-header>}
        </header>

        <nav class="wb-navbar">
          <onto-navbar ref={this.assignNavbarRef()}
            navbar-collapsed={this.isLowResolution}></onto-navbar>
        </nav>

        {this.hasPermission ? (
          <div class='main-slot-wrapper'>
            <slot name="main"></slot>
          </div>
        ) : (
          <onto-permission-banner></onto-permission-banner>
        )}
        <footer class="wb-footer">
          {this.isVisible && <onto-footer></onto-footer>}
        </footer>
        <onto-tooltip></onto-tooltip>
        <onto-toastr></onto-toastr>
      </Host>
    );
  }

  // ========================
  // Event Listeners
  // ========================
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

  // ========================
  // Handlers
  // ========================
  private windowResizeHandler(): void {
    this.isLowResolution = WindowService.getWindow().innerWidth <= WINDOW_WIDTH_FOR_COLLAPSED_NAVBAR;
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

  // ========================
  // Security & Permissions
  // ========================
  private subscribeToSecurityChanges() {
    const securityContextService = ServiceProvider.get(SecurityContextService);
    this.subscriptions.add(
      securityContextService.onAuthenticatedUserChanged((authenticatedUser) => {
        this.authenticatedUser = authenticatedUser;
        this.updateVisibility();
      })
    );

    this.subscriptions.add(
      securityContextService.onSecurityConfigChanged((securityConfig) => {
        this.securityConfig = securityConfig;
        this.updateVisibility();
      })
    );

    this.subscriptions.add(
      ServiceProvider.get(EventService).subscribe(EventName.LOGOUT, () => {
        this.setNavbarItemVisibility();
        this.updateVisibility();
      })
    );
    this.subscriptions.add(
      securityContextService.onAuthTokenChanged(()=>{
        this.setNavbarItemVisibility();
        this.updateVisibility();
      })
    );
  }

  private setPermission(permissions: RestrictedPages) {
    if (permissions) {
      const path = getPathName();
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

  private updateVisibility() {
    if (!this.authenticationService.isSecurityEnabled()) {
      this.isVisible = true;
      this.showFooter = true;
    } else {
      const hasAuth = !!this.authenticatedUser && !!this.securityConfig;
      const isAuthenticated = this.authenticationService.isAuthenticated() || this.authenticationService.hasFreeAccess();

      this.isVisible = hasAuth && isAuthenticated;
      this.showFooter = isAuthenticated;
    }
  }

  private isAuthenticatedFully() {
    const authService = ServiceProvider.get(AuthenticationService);
    return !authService.isSecurityEnabled() || authService.isAuthenticated() || authService.hasFreeAccess();
  }

  private shouldShowMenu(role: Authority): boolean {
    return this.isAuthenticatedFully()
      && ServiceProvider.get(AuthenticationService).hasRole(role);
  }

  // ========================
  // Navbar logic
  // ========================
  private assignNavbarRef() {
    return (navbar: HTMLOntoNavbarElement) => {
      this.navbarRef = navbar;
      this.navbarRef.menuItems = WindowService.getWindow().PluginRegistry.get('main.menu');
      this.setNavbarItemVisibility();
    };
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
}
