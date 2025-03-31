import {Component, Host, h, State} from '@stencil/core';
import {
  ServiceProvider,
  LicenseContextService,
  License,
  SubscriptionList,
  MonitoringService,
  RepositoryContextService,
  OperationStatusSummary,
  SecurityContextService,
  AuthenticatedUser,
  SecurityConfig,
  AuthenticationService,
  FibonacciGenerator,
  OntoToastrService, RepositoryLocation, RepositoryLocationContextService, EventService, EventName,
  getPathName, isHomePage
} from '@ontotext/workbench-api';
import {TranslationService} from '../../services/translation.service';
import {HtmlUtil} from '../../utils/html-util';

/**
 * OntoHeader component for rendering the header of the application.
 * This component includes a search component, license alert (if applicable),
 * repository selector, and language selector.
 */
@Component({
  tag: 'onto-header',
  styleUrl: 'onto-header.scss'
})
export class OntoHeader {
  private readonly monitoringService = ServiceProvider.get(MonitoringService);
  private readonly repositoryContextService = ServiceProvider.get(RepositoryContextService);
  private readonly repositoryLocationContextService = ServiceProvider.get(RepositoryLocationContextService);
  private readonly securityContextService = ServiceProvider.get(SecurityContextService);
  private readonly authenticationService = ServiceProvider.get(AuthenticationService);
  private readonly toastrService = ServiceProvider.get(OntoToastrService);
  private readonly UPDATE_ACTIVE_OPERATION_TIME_INTERVAL = 2000;
  private readonly fibonacciGenerator = new FibonacciGenerator();

  private repositoryId?: string;
  private repositoryLocation?: RepositoryLocation;
  private isActiveLocationLoading = false;
  private pollingInterval: number;

  /** The active operations summary for all monitoring operations */
  @State() private activeOperations?: OperationStatusSummary;

  /** The current license information */
  @State() private license: License;

  /** Menu should appear, when security is enabled and user is authenticated */
  @State() private showUserMenu: boolean;

  /** Whether the search component should appear */
  @State() private shouldShowSearch: boolean = true;

  @State() private isHomePage = isHomePage();

  /** Array of subscription cleanup functions */
  private readonly subscriptions: SubscriptionList = new SubscriptionList();
  private user: AuthenticatedUser;
  private securityConfig: SecurityConfig;
  private skipUpdateActiveOperationsTimes = 0;

  disconnectedCallback(): void {
    this.subscriptions.unsubscribeAll();
    this.stopOperationPolling();
  }

  componentWillLoad() {
    this.subscribeToLicenseChange();
    this.subscribeToRepositoryIdChange();
    this.subscribeToSecurityContextChange();
    this.subscribeToActiveRepositoryLocationChange();
    this.subscribeToActiveRepoLoadingChange();
    this.subscribeToNavigationEnd();
  }

  render() {
    return (
      <Host>
        <div class="header-component">
          <onto-search-icon
            onClick={this.showViewResourceMessage()}
            style={{display: this.shouldShowSearch  && this.isHomePage ? 'block' : 'none'}}>
          </onto-search-icon>
          <onto-rdf-search
            style={{display: this.shouldShowSearch  && !this.isHomePage ? 'block' : 'none'}}>
          </onto-rdf-search>
          {this.activeOperations?.allRunningOperations.getItems().length
            ? <onto-operations-notification activeOperations={this.activeOperations}>
            </onto-operations-notification>
            : ''
          }
          {Boolean(this.license) && !this.license?.valid ?
            <onto-license-alert license={this.license}></onto-license-alert> : ''
          }
          <onto-repository-selector></onto-repository-selector>
          {this.showUserMenu ? <onto-user-menu user={this.user}></onto-user-menu> : ''}
          <onto-language-selector dropdown-alignment="right"></onto-language-selector>
        </div>
      </Host>
    );
  }

  private startOperationPolling() {
    clearInterval(this.pollingInterval);
    this.pollingInterval = window.setInterval(() => {
      if (!this.authenticationService.isAuthenticated(this.securityConfig, this.user)) {
        this.activeOperations = undefined;
      }

      if (this.skipUpdateActiveOperationsTimes > 0) {
        // Requested to skip this run, the number of skips is a Fibonacci sequence when errors are consecutive.
        this.skipUpdateActiveOperationsTimes--;
        return;
      }

      this.monitoringService
        .getOperations(this.repositoryId)
        .then((operations) => {
          this.activeOperations = operations;
          this.fibonacciGenerator.reset();
          this.skipUpdateActiveOperationsTimes = 0;
        })
        .catch(() => this.skipUpdateActiveOperationsTimes = this.fibonacciGenerator.next());
    }, this.UPDATE_ACTIVE_OPERATION_TIME_INTERVAL);
  }

  private stopOperationPolling() {
    clearInterval(this.pollingInterval);
    this.activeOperations = undefined;
  }

  private subscribeToRepositoryIdChange() {
    this.subscriptions.add(
      this.repositoryContextService.onSelectedRepositoryIdChanged((repositoryId) => {
        this.repositoryId = repositoryId;
        this.repositoryId ? this.startOperationPolling() : this.stopOperationPolling();
        this.shouldShowSearch = this.shouldShowRdfSearch();
      })
    );
  }

  private shouldShowRdfSearch(): boolean {
    return !!this.repositoryId && !!this.repositoryLocation &&
      (!this.isActiveLocationLoading || this.isActiveLocationLoading && getPathName() === '/repository');
  }

  private subscribeToActiveRepositoryLocationChange() {
    this.subscriptions.add(
      this.repositoryLocationContextService.onActiveLocationChanged((repositoryLocation) => {
        this.repositoryLocation = repositoryLocation;
        this.shouldShowSearch = this.shouldShowRdfSearch();
      })
    );
  }

  private subscribeToActiveRepoLoadingChange() {
    this.subscriptions.add(
      this.repositoryLocationContextService.onIsLoadingChanged((isLoading) => {
        this.isActiveLocationLoading = isLoading;
        this.shouldShowSearch = this.shouldShowRdfSearch();
      })
    );
  }

  private subscribeToLicenseChange() {
    this.subscriptions.add(ServiceProvider.get(LicenseContextService)
      .onLicenseChanged(license => {
        this.license = license;
      }));
  }

  private subscribeToSecurityContextChange() {
    // TODO: This should be done by the authentication service, when the config and auth user are available synchronously
    this.subscriptions.add(this.securityContextService.onAuthenticatedUserChanged((user) => {
      this.user = user;
      this.showUserMenu = this.shouldShowUserMenu();
    }));
    this.subscriptions.add(this.securityContextService.onSecurityConfigChanged((config) => {
      this.securityConfig = config;
      this.showUserMenu = this.shouldShowUserMenu();
    }));
  }

  private shouldShowUserMenu() {
    if (!this.user || !this.securityConfig) {
      return false;
    }
    return this.securityConfig.enabled && this.authenticationService.isAuthenticated(this.securityConfig, this.user);
  }

  private showViewResourceMessage() {
    return (event: MouseEvent) => {
      event.stopPropagation();
      this.toastrService.info(TranslationService.translate('rdf_search.toasts.use_view_resource'));
      this.shouldShowSearch = false;
      HtmlUtil.focusElement('#search-resource-input-home input');
    };
  }

  private subscribeToNavigationEnd() {
    this.subscriptions.add(
      ServiceProvider.get(EventService).subscribe(
        EventName.NAVIGATION_END, () => {
          this.shouldShowSearch = this.shouldShowRdfSearch();
          this.isHomePage = isHomePage();
          console.log('Navigation end', this.isHomePage);
        }
      )
    );
  }
}
