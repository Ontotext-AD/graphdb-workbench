import {Component, Element, h, Host, Listen, State} from '@stencil/core';
import {NavbarToggledEvent} from '../onto-navbar/navbar-toggled-event';
import {debounce} from '../../utils/function-utils';
import {WINDOW_WIDTH_FOR_COLLAPSED_NAVBAR} from '../../models/constants';
import {
  ApplicationLifecycleContextService,
  AuthenticatedUser,
  AuthenticationService,
  AuthenticationStorageService,
  Authority,
  AuthorizationService,
  EventName,
  EventService,
  ExternalMenuItemModel,
  LocalStorageSubscriptionHandlerService,
  navigate,
  NavigationContextService,
  NavigationEndPayload,
  RuntimeConfigurationContextService,
  SecurityConfig,
  SecurityContextService,
  service,
  StorageKey,
  SubscriptionList,
  WindowService
} from '@ontotext/workbench-api';
import {TranslationService} from '../../services/translation.service';

@Component({
  tag: 'onto-layout',
  styleUrl: 'onto-layout.scss',
  shadow: false
})
export class OntoLayout {
  // ========================
  // Services
  // ========================
  private readonly authenticationService = service(AuthenticationService);
  private readonly authorizationService = service(AuthorizationService);
  private readonly navigationContextService = service(NavigationContextService);
  private readonly authStorageService = service(AuthenticationStorageService);
  private readonly runtimeConfigurationContextService = service(RuntimeConfigurationContextService);
  private readonly eventService = service(EventService);
  private readonly applicationLifecycleContextService = service(ApplicationLifecycleContextService);

  private readonly fullJwtKey = `${StorageKey.GLOBAL_NAMESPACE}.${this.authStorageService.NAMESPACE}.${this.authStorageService.jwtKey}`;
  private readonly fullAuthenticatedKey = `${StorageKey.GLOBAL_NAMESPACE}.${this.authStorageService.NAMESPACE}.${this.authStorageService.authenticatedKey}`;
  private readonly authEvents = [this.fullJwtKey, this.fullAuthenticatedKey];

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
  @State() showHeader = this.isAuthenticatedFully();
  @State() showNavbar = false;
  @State() private isEmbedded = false;
  @State() private loading = true;

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
    this.subscribeToNavigationEnd();
    this.subscribeToRuntimeConfigurationChanges();
    this.subscribeToApplicationChange();
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
      <Host class={{
        'wb-layout': true,
        'is-embedded': this.isEmbedded,
        'hide-navbar': !this.showNavbar
      }}>
        {/* Default slot is explicitly defined to be able to hide the main content in the user permission check */}
        <div class="default-slot-wrapper">
          <slot name="default"></slot>
        </div>
        {!this.isEmbedded &&
          <header class="wb-header">
            {this.showHeader && <onto-header></onto-header>}
          </header>
        }
        {!this.isEmbedded && this.showNavbar &&
          <nav class="wb-navbar">
            <onto-navbar ref={this.assignNavbarRef()} navbar-collapsed={this.isLowResolution}></onto-navbar>
          </nav>
        }

        <div class={{'main-slot-wrapper': true, 'loading': this.loading}}>
          {this.loading && <div class="loader-wrapper">
            <onto-loader size={96} messageText={TranslationService.translate('common.loading')}></onto-loader>
          </div>}
          <slot name="main"></slot>
        </div>

        {!this.isEmbedded &&
          <footer class="wb-footer">
            <onto-footer></onto-footer>
          </footer>
        }
        <onto-tooltip></onto-tooltip>
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

  private readonly handleStorageChange = (event: StorageEvent) => {
    const localStorageSubscriptionHandlerService = service(LocalStorageSubscriptionHandlerService);
    localStorageSubscriptionHandlerService.handleStorageChange(event);
    this.handleAuthChange(event.key);
  };

  private handleAuthChange(changedKey: string | null) {
    if (!changedKey) {
      return;
    }

    if (this.authEvents.includes(changedKey)) {
      const authenticated = this.authStorageService.isAuthenticated();
      if (authenticated) {
        navigate(this.navigationContextService.getPreviousRoute() ?? './');
      } else {
        navigate('login');
      }
      WindowService.getWindow().location.reload();
    }
  }

  // ========================
  // Security & Permissions
  // ========================
  private subscribeToSecurityChanges() {
    const securityContextService = service(SecurityContextService);
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
      this.eventService.subscribe(EventName.LOGIN, () => {
        this.setNavbarItemVisibility();
        this.updateVisibility();
      })
    );

    this.subscriptions.add(
      this.eventService.subscribe(EventName.LOGOUT, () => {
        this.setNavbarItemVisibility();
        this.updateVisibility();
        navigate('login');
      })
    );
  }

  private subscribeToRuntimeConfigurationChanges() {
    this.subscriptions.add(
      this.runtimeConfigurationContextService.onRuntimeConfigurationChanged((config) => {
        this.isEmbedded = config?.isEmbedded ?? false;
      })
    );
  }

  private updateVisibility() {
    if (!this.authenticationService.isSecurityEnabled()) {
      this.showNavbar = true;
      this.showHeader = true;
    } else {
      this.showHeader = this.authenticationService.isAuthenticated() || this.authorizationService.hasFreeAccess();
      this.showNavbar = this.authenticationService.isAuthenticated() || this.authorizationService.hasFreeAccess();
    }
  }

  private isAuthenticatedFully() {
    return !this.authenticationService.isSecurityEnabled() || this.authenticationService.isAuthenticated() || this.authorizationService.hasFreeAccess();
  }

  private shouldShowMenu(role: Authority): boolean {
    return this.isAuthenticatedFully() && this.authorizationService.hasRole(role);
  }

  // ========================
  // Navbar logic
  // ========================
  private assignNavbarRef() {
    return (navbar: HTMLOntoNavbarElement) => {
      this.navbarRef = navbar;
      if (!this.navbarRef) {
        return;
      }
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

  private subscribeToNavigationEnd() {
    this.subscriptions.add(
      this.eventService.subscribe(EventName.NAVIGATION_END, (navigationEndPayload: NavigationEndPayload) => {
        this.navigationContextService.updatePreviousRoute(navigationEndPayload.oldUrl);
      }));
  }

  private subscribeToApplicationChange() {
    this.subscriptions.add(
      this.applicationLifecycleContextService.onApplicationStateBeforeChange((state) => {
        if (state) {
          this.loading = true;
        }
      }));

    this.subscriptions.add(
      this.applicationLifecycleContextService.onApplicationStateChange((state) => {
        if (state) {
          this.loading = false;
        }
      })
    );
  }
}
