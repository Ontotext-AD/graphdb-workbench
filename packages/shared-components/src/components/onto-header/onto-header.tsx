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
  OntoToastrService,
  RepositoryLocation,
  RepositoryLocationContextService,
  EventService,
  EventName,
  getPathName,
  isHomePage,
  NamespacesService,
  NamespacesContextService,
  RepositoryStorageService,
  RepositoryList,
  Repository, RepositoryService, LanguageService, LanguageContextService
} from '@ontotext/workbench-api';
import {TranslationService} from '../../services/translation.service';
import {HtmlUtil} from '../../utils/html-util';
import {DropdownItem} from "../../models/dropdown/dropdown-item";
import {SelectorItemButton} from "../onto-repository-selector/selector-item";

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
  private readonly repositoryService = ServiceProvider.get(RepositoryService);
  private readonly repositoryStorageService = ServiceProvider.get(RepositoryStorageService);
  private readonly securityContextService = ServiceProvider.get(SecurityContextService);
  private readonly authenticationService = ServiceProvider.get(AuthenticationService);
  private readonly toastrService = ServiceProvider.get(OntoToastrService);
  private readonly namespacesService = ServiceProvider.get(NamespacesService);
  private readonly namespaceContextService = ServiceProvider.get(NamespacesContextService);
  private readonly languageService: LanguageService = ServiceProvider.get(LanguageService);
  private readonly UPDATE_ACTIVE_OPERATION_TIME_INTERVAL = 2000;
  private readonly fibonacciGenerator = new FibonacciGenerator();

  private repositoryId?: string;
  private repositoryLocation?: RepositoryLocation;
  private isActiveLocationLoading = false;
  private pollingInterval: number;
  private repositoryItems: DropdownItem<Repository>[] = [];
  private totalTripletsFormatter: Intl.NumberFormat;


  /** The active operations summary for all monitoring operations */
  @State() private activeOperations?: OperationStatusSummary;

  /** The current license information */
  @State() private license: License;

  /** Menu should appear, when security is enabled and user is authenticated */
  @State() private showUserMenu: boolean;

  /** Whether the search component should appear */
  @State() private shouldShowSearch: boolean = true;

  @State() private isHomePage = isHomePage();

  /**
   * The list of repositories in the database.
   */
  @State() private repositoryList: RepositoryList;

  /**
   * The model of the currently selected repository, if any.
   */
  @State() currentRepository: Repository;

  /** Array of subscription cleanup functions */
  private readonly subscriptions: SubscriptionList = new SubscriptionList();
  private user: AuthenticatedUser;
  private securityConfig: SecurityConfig;
  private skipUpdateActiveOperationsTimes = 0;

  disconnectedCallback(): void {
    this.subscriptions.unsubscribeAll();
    this.stopOperationPolling();
  }

  connectedCallback() {
    // get the current repository id from the storage
    this.repositoryId = this.repositoryStorageService.get(this.repositoryContextService.SELECTED_REPOSITORY_ID).getValueOrDefault(undefined);
    this.setupTotalRepository();
    this.subscribeToRepositoryListChanged();
    this.subscribeToLicenseChange();
    this.subscribeToRepositoryIdChange();
    this.subscribeToSecurityContextChange();
    this.subscribeToActiveRepositoryLocationChange();
    this.subscribeToActiveRepoLoadingChange();
    this.subscriptions.add(this.subscribeToLanguageChanged());
    this.subscribeToNavigationEnd();
  }

  render() {
    return (
      <Host>
        <div class="header-component">
          <onto-search-icon
            onClick={this.showViewResourceMessage}
            style={{display: this.shouldShowSearch && this.isHomePage ? 'block' : 'none'}}>
          </onto-search-icon>
          <onto-rdf-search
            style={{display: this.shouldShowSearch && !this.isHomePage ? 'block' : 'none'}}>
          </onto-rdf-search>
          {this.activeOperations?.allRunningOperations.getItems().length
            ? <onto-operations-notification activeOperations={this.activeOperations}>
            </onto-operations-notification>
            : ''
          }
          {Boolean(this.license) && !this.license?.valid ?
            <onto-license-alert license={this.license}></onto-license-alert> : ''
          }
          <onto-repository-selector
            currentRepository={this.currentRepository}
            items={this.repositoryItems}
            repositorySizeInfoFetcher={this.repositorySizeInfoFetcher}
            totalTripletsFormatter={this.totalTripletsFormatter}
            canWriteRepo={this.canWriteRepo}>
          </onto-repository-selector>
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

  private subscribeToRepositoryListChanged(): () => void {
    return this.repositoryContextService.onRepositoryListChanged((repositories: RepositoryList) => {
      if (!repositories || !repositories.getItems().length) {
        this.resetOnMissingRepositories();
      } else {
        this.initOnRepositoryListChanged(repositories);
      }
    });
  }

  private initOnRepositoryListChanged(repositories: RepositoryList): void {
    this.repositoryList = repositories;
    const location = '';
    const repository = repositories.findRepository(this.repositoryId, location);
    // currently selected repository could be deleted and not in the list at this point
    this.currentRepository = repository;
    this.repositoryContextService.updateSelectedRepository(repository);
    this.repositoryContextService.updateSelectedRepositoryId(this.repositoryId);
    this.repositoryItems = this.getRepositoriesDropdownItems();
  }

  private resetOnMissingRepositories(): void {
    this.repositoryItems = [];
    this.repositoryList = new RepositoryList();
    this.repositoryId = undefined;
    this.currentRepository = undefined;
  }

  private getRepositoriesDropdownItems(): DropdownItem<Repository>[] {
    if (!this.repositoryList || !this.repositoryList.getItems().length) {
      return [];
    }
    this.repositoryList.sortByLocationAndId();
    let repositories: Repository[];
    if (this.currentRepository) {
      repositories = this.repositoryList.filterByIds([this.currentRepository.id]);
    } else {
      repositories = this.repositoryList.getItems();
    }

    // TODO: GDB-10442 filter if not rights to read repo see jwt-auth.service.js canReadRepo function
    return repositories
      .map((repository) => {
        return new DropdownItem<Repository>()
          .setName(<SelectorItemButton repository={repository}/>)
          .setValue(repository)
          .setDropdownTooltipTrigger('mouseenter focus')
      });
  }


  private canWriteRepoInLocation(_repository: Repository): boolean {
    // TODO: implement the condition when GDB-10442 is ready
    return true;
  }

  private canWriteRepo = (repo: Repository) => {
    return this.canWriteRepoInLocation(repo);
  };

  private repositorySizeInfoFetcher = (repo: Repository) => {
    return this.repositoryService.getRepositorySizeInfo(repo);
  };

  private subscribeToRepositoryIdChange() {
    this.subscriptions.add(
      this.repositoryContextService.onSelectedRepositoryIdChanged((repositoryId) => {
        this.repositoryId = repositoryId;
        this.repositoryId ? this.startOperationPolling() : this.stopOperationPolling();
        this.shouldShowSearch = this.shouldShowRdfSearch();
        this.loadNamespaces();
        this.changeCurrentRepository(this.repositoryId)
      })
    );
  }

  private shouldShowRdfSearch(): boolean {
    return !!this.repositoryId && !!this.repositoryLocation &&
      (!this.isActiveLocationLoading || this.isActiveLocationLoading && getPathName() === '/repository');
  }

  private changeCurrentRepository(newRepositoryId: string): void {
    this.currentRepository = this.repositoryList.findRepository(newRepositoryId, '');
    this.repositoryItems = this.getRepositoriesDropdownItems();
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

  private showViewResourceMessage= (event:MouseEvent) => {
    event.stopPropagation();
    this.toastrService.info(TranslationService.translate('rdf_search.toasts.use_view_resource'));
    this.shouldShowSearch = false;
    HtmlUtil.focusElement('#search-resource-input-home input');
  }

  private subscribeToNavigationEnd() {
    this.subscriptions.add(
      ServiceProvider.get(EventService).subscribe(
        EventName.NAVIGATION_END, () => {
          this.shouldShowSearch = this.shouldShowRdfSearch();
          this.isHomePage = isHomePage();
        }
      )
    );
  }

  private loadNamespaces() {
    if (this.repositoryId) {
      this.namespacesService.getNamespaces(this.repositoryId)
        .then((namespaces) => this.namespaceContextService.updateNamespaces(namespaces))
    }
  }

  private subscribeToLanguageChanged(): () => void {
    return ServiceProvider.get(LanguageContextService)
      .onSelectedLanguageChanged((language) => this.setupTotalRepository(language));
  }

  private setupTotalRepository(language?: string): void {
    if (!language) {
      language = this.languageService.getDefaultLanguage();
    }
    this.totalTripletsFormatter = new Intl.NumberFormat(language, {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });
  }
}
