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
  ConfigurationContextService,
  AuthenticatedUser,
  SecurityConfig,
  FibonacciGenerator,
  OntoToastrService,
  RepositoryLocationContextService,
  EventService,
  EventName,
  getPathName,
  isHomePage,
  NamespacesService,
  NamespacesContextService,
  RepositoryList,
  Repository,
  RepositoryService,
  LanguageService,
  LanguageContextService,
  ObjectUtil,
  getCurrentRoute, AuthenticationService, WindowService, AuthorizationService, navigateTo
} from '@ontotext/workbench-api';
import {TranslationService} from '../../services/translation.service';
import {HtmlUtil} from '../../utils/html-util';
import {DropdownItem} from '../../models/dropdown/dropdown-item';
import {SelectorItemButton} from '../onto-repository-selector/selector-item';
import {ResourceSearchConstants} from '../../models/resource-search/resource-search-constants';

const labelKeys = {
  LOGO_LINK: 'menu.logo.link.title'
};

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
  // ========================
  // Services
  // ========================
  private readonly monitoringService = ServiceProvider.get(MonitoringService);
  private readonly repositoryContextService = ServiceProvider.get(RepositoryContextService);
  private readonly repositoryLocationContextService = ServiceProvider.get(RepositoryLocationContextService);
  private readonly repositoryService = ServiceProvider.get(RepositoryService);
  private readonly securityContextService = ServiceProvider.get(SecurityContextService);
  private readonly toastrService = ServiceProvider.get(OntoToastrService);
  private readonly namespacesService = ServiceProvider.get(NamespacesService);
  private readonly namespaceContextService = ServiceProvider.get(NamespacesContextService);
  private readonly languageService: LanguageService = ServiceProvider.get(LanguageService);
  private readonly UPDATE_ACTIVE_OPERATION_TIME_INTERVAL = 2000;
  private readonly fibonacciGenerator = new FibonacciGenerator();
  private readonly authService = ServiceProvider.get(AuthenticationService);
  private readonly authorizationService = ServiceProvider.get(AuthorizationService);
  private readonly eventService = ServiceProvider.get(EventService);
  private readonly configurationContextService = ServiceProvider.get(ConfigurationContextService);

  // ========================
  // State
  // ========================
  /** The active operations summary for all monitoring operations */
  @State() activeOperations?: OperationStatusSummary;
  /** The current license information */
  @State() license: License;
  @State() isFreeAccessEnabled: boolean;
  /** Whether the search component should appear */
  @State() shouldShowSearch = true;
  @State() isHomePage = isHomePage();
  /** The list of repositories in the database. */
  @State() repositoryList: RepositoryList;
  @State() currentRoute: string;
  /** The model of the currently selected repository, if any. */
  @State() currentRepository: Repository | undefined;
  @State() securityConfig: SecurityConfig;
  @State() private user: AuthenticatedUser;
  @State() private showUserMenu = false;
  @State() private showLoginButton = false;

  // ========================
  // Private
  // ========================
  private isActiveLocationLoading = false;
  private pollingInterval: number;
  private repositoryItems: DropdownItem<Repository>[] = [];
  private totalTripletsFormatter: Intl.NumberFormat;
  private expansionRatioFormatter: Intl.NumberFormat;
  /** Array of subscription cleanup functions */
  private readonly subscriptions: SubscriptionList = new SubscriptionList();
  private skipUpdateActiveOperationsTimes = 0;

  private labels = {
    [labelKeys.LOGO_LINK]: TranslationService.translate(labelKeys.LOGO_LINK)
  };

  // ========================
  // Lifecycle methods
  // ========================
  disconnectedCallback(): void {
    this.subscriptions.unsubscribeAll();
    this.stopOperationPolling();
  }

  connectedCallback() {
    this.currentRepository = this.repositoryContextService.getSelectedRepository();
    this.setupTotalRepositoryFormater();
    this.setupExpansionRatioFormater();
    this.subscribeToEvents();
    this.currentRoute = getCurrentRoute();
    this.startOperationPolling();
    this.onTranslate(labelKeys.LOGO_LINK);
  }

  render() {
    const logoPath = this.configurationContextService.getApplicationConfiguration().applicationLogoPath;

    return (
      <Host>
        <div class="header-component">
          <div class="left-section brand">
            <a class="home-page" onClick={navigateTo('./')}>
              <img src={logoPath} class="big-logo" alt={this.labels[labelKeys.LOGO_LINK]}/>
            </a>
          </div>
          <div class="right-section">
            <onto-search-icon
              class="rdf-search-button"
              onClick={this.showViewResourceMessage}
              data-test="onto-show-view-resource-message"
              style={{display: this.shouldShowSearch && this.isHomePage ? 'block' : 'none'}}>
            </onto-search-icon>
            <onto-rdf-search
              data-test="onto-open-rdf-search-button"
              style={{display: this.shouldShowSearch && !this.isHomePage ? 'block' : 'none'}}>
            </onto-rdf-search>
            {this.activeOperations?.allRunningOperations.getItems().length
              ? <onto-operations-notification activeOperations={this.activeOperations}>
              </onto-operations-notification>
              : ''
            }
            {this.license && !this.license?.valid ?
              <onto-license-alert license={this.license}></onto-license-alert> : ''
            }
            <onto-repository-selector
              currentRepository={this.currentRepository}
              items={this.repositoryItems}
              repositorySizeInfoFetcher={this.repositorySizeInfoFetcher}
              totalTripletsFormatter={this.totalTripletsFormatter}
              expansionRatioFormatter={this.expansionRatioFormatter}
              canWriteRepo={this.canWriteRepo}>
            </onto-repository-selector>
            <onto-language-selector dropdown-alignment="right"></onto-language-selector>
            {this.showUserMenu && this.user ?
              <onto-user-menu user={this.user} securityConfig={this.securityConfig}></onto-user-menu> : ''}
            {this.showLoginButton ? <onto-user-login></onto-user-login> : ''}
          </div>
        </div>
      </Host>
    );
  }

  // ========================
  // Subscriptions
  // ========================
  private subscribeToEvents(): void {
    this.subscribeToSecurityContextChange();
    this.subscribeToRepositoryListChanged();
    this.subscribeToLicenseChange();
    this.subscribeToRepositoryChange();
    this.subscribeToActiveRepositoryLocationChange();
    this.subscribeToActiveRepoLoadingChange();
    this.subscribeToNavigationEnd();
    this.subscribeToLanguageChanged();
    this.subscribeToAuthenticatedUserChange();
  }

  private subscribeToRepositoryListChanged(): () => void {
    return this.repositoryContextService.onRepositoryListChanged((repositories: RepositoryList) => {
      if (!repositories?.getItems().length) {
        this.resetOnMissingRepositories();
      } else {
        this.initOnRepositoryListChanged(repositories);
      }
    });
  }

  private subscribeToLicenseChange() {
    this.subscriptions.add(ServiceProvider.get(LicenseContextService)
      .onLicenseChanged((license) => {
        this.license = license;
      }));
  }

  private subscribeToRepositoryChange() {
    this.subscriptions.add(
      this.repositoryContextService.onSelectedRepositoryChanged((repository) => {
        this.currentRepository = repository;
        this.shouldShowSearch = this.shouldShowRdfSearch();
        this.loadNamespaces();
        this.updateRepositoryItems();
      })
    );
  }

  private subscribeToSecurityContextChange() {
    this.subscriptions.add(this.securityContextService.onSecurityConfigChanged((config) => {
      this.securityConfig = config;
      setTimeout(() => {
        this.updateVisibility();
      });
    }));
  }

  private subscribeToAuthenticatedUserChange() {
    this.subscriptions.add(this.securityContextService.onAuthenticatedUserChanged((user) => {
      this.user = user;
      this.updateRepositoryItems();
      this.updateVisibility();
    }));
  }

  private subscribeToActiveRepositoryLocationChange() {
    this.subscriptions.add(
      this.repositoryLocationContextService.onActiveLocationChanged(() => {
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

  private subscribeToNavigationEnd() {
    this.subscriptions.add(
      this.eventService.subscribe(
        EventName.NAVIGATION_END, () => {
          this.shouldShowSearch = this.shouldShowRdfSearch();
          this.isHomePage = isHomePage();
          this.currentRoute = getCurrentRoute();
          this.updateVisibility();
        }
      )
    );
  }

  private subscribeToLanguageChanged(): void {
    this.subscriptions.add(
      ServiceProvider.get(LanguageContextService)
        .onSelectedLanguageChanged((language) => {
          this.setupTotalRepositoryFormater(language);
          this.setupExpansionRatioFormater(language);
        }));
  }

  private onTranslate(key: string): void {
    this.subscriptions.add(
      TranslationService.onTranslate(
        key,
        [],
        (translation) => {
          this.labels[key] = translation;
        }));
  }

  // ========================
  // Repository Logic
  // ========================
  private resetOnMissingRepositories(): void {
    this.repositoryItems = [];
    this.repositoryList = new RepositoryList();
    this.currentRepository = undefined;
  }

  private initOnRepositoryListChanged(repositories: RepositoryList): void {
    this.repositoryList = repositories;
    this.updateRepositoryItems();
  }

  private updateRepositoryItems() {
    this.repositoryItems = this.getRepositoriesDropdownItems();
  }

  private getRepositoriesDropdownItems(): DropdownItem<Repository>[] {
    if (!this.repositoryList?.getItems().length) {
      return [];
    }
    this.repositoryList.sortByLocationAndId();
    let repositories: Repository[];
    if (this.currentRepository) {
      repositories = this.repositoryList.filterByRepository([this.currentRepository]);
    } else {
      repositories = this.repositoryList.getItems();
    }

    return repositories
      .filter((repository) => this.authorizationService.canReadRepo(repository) || this.authorizationService.canReadGqlRepo(repository))
      .map((repository) => {
        return new DropdownItem<Repository>()
          .setName(<SelectorItemButton repository={repository}/>)
          .setValue(repository)
          .setGuideSelector(`repository-id-${repository.id}`);
      });
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private canWriteRepoInLocation(_repository: Repository): boolean {
    // TODO: implement the condition when GDB-10442 is ready
    return true;
  }

  private readonly canWriteRepo = (repo: Repository) => {
    return this.canWriteRepoInLocation(repo);
  };

  private readonly repositorySizeInfoFetcher = (repo: Repository) => {
    return this.repositoryService.getRepositorySizeInfo(repo);
  };

  private loadNamespaces() {
    if (!this.currentRepository || !this.authorizationService.canReadRepo(this.currentRepository)) {
      return;
    }
    // TODO: check why loaction not used maybe it is added in autorization interceptor
    this.namespacesService.getNamespaces(this.currentRepository.id)
      .then((namespaces) => this.namespaceContextService.updateNamespaces(namespaces));
  }

  private updateVisibility() {
    const isSecurityEnabled = this.securityConfig?.enabled;
    const isLoggedIn = this.authService.isLoggedIn();
    let isAuthenticated = false;
    try {
      isAuthenticated = this.authService.isAuthenticated();
    } catch {
      isAuthenticated = false;
    }
    const isFreeAccessEnabled = this.securityConfig?.freeAccess?.enabled;
    this.showLoginButton = isSecurityEnabled && isFreeAccessEnabled && !isLoggedIn && this.currentRoute !== 'login';
    this.showUserMenu = isSecurityEnabled && isAuthenticated && isLoggedIn;
    this.shouldShowSearch = this.shouldShowRdfSearch();
  }

  // ========================
  // Monitoring and pooling
  // ========================
  private startOperationPolling() {
    clearInterval(this.pollingInterval);
    this.pollingInterval = WindowService.getWindow().setInterval(() => {
      if (!this.authService.isAuthenticated()) {
        this.activeOperations = undefined;
        return;
      }

      if (this.skipUpdateActiveOperationsTimes > 0) {
        // Requested to skip this run, the number of skips is a Fibonacci sequence when errors are consecutive.
        this.skipUpdateActiveOperationsTimes--;
        return;
      }

      if (!this.currentRepository) {
        return;
      }

      this.monitoringService
        .getOperations(this.currentRepository.id)
        .then((operations) => {
          if (!ObjectUtil.deepEqual(this.activeOperations, operations)) {
            this.activeOperations = operations;
          }
          this.fibonacciGenerator.reset();
          this.skipUpdateActiveOperationsTimes = 0;
        })
        .catch(() => {
          this.activeOperations = undefined;
          this.skipUpdateActiveOperationsTimes = this.fibonacciGenerator.next();
        });
    }, this.UPDATE_ACTIVE_OPERATION_TIME_INTERVAL);
  }

  private stopOperationPolling() {
    clearInterval(this.pollingInterval);
    this.activeOperations = undefined;
  }

  // ========================
  // Render logic
  // ========================
  private shouldShowRdfSearch(): boolean {
    return !!this.currentRepository &&
      (!this.isActiveLocationLoading || getPathName() === '/repository') &&
      this.authorizationService.canReadRepo(this.currentRepository);
  }

  private readonly showViewResourceMessage = (event: MouseEvent) => {
    event.stopPropagation();
    this.toastrService.info(TranslationService.translate('rdf_search.toasts.use_view_resource'));
    this.shouldShowSearch = false;
    HtmlUtil.focusElement('#search-resource-input-home input');
    this.eventService.emit({NAME: ResourceSearchConstants.RDF_SEARCH_ICON_CLICKED});
  };

  // ========================
  // Language, formatting
  // ========================
  private setupTotalRepositoryFormater(language?: string): void {
    if (!language) {
      language = this.languageService.getDefaultLanguage();
    }
    this.totalTripletsFormatter = new Intl.NumberFormat(language, {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });
  }

  private setupExpansionRatioFormater(language?: string): void {
    if (!language) {
      language = this.languageService.getDefaultLanguage();
    }
    this.expansionRatioFormatter = new Intl.NumberFormat(language, {
      style: 'decimal',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }
}
