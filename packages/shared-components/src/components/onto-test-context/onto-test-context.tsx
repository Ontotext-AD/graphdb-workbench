import {Component, Method} from '@stencil/core';
import {
  EventService,
  AuthenticatedUser,
  AuthenticatedUserMapper,
  LanguageContextService,
  License,
  LicenseContextService,
  NavigationEnd,
  MapperProvider,
  ProductInfo,
  ProductInfoContextService,
  RepositoryContextService,
  RepositoryService,
  RestrictedPages,
  SecurityContextService,
  SecurityConfig,
  ServiceProvider,
  ToastMessage,
  EventEmitter,
  CREATE_TOAST_EVENT,
  RepositoryLocationContextService,
  AutocompleteContextService,
  NamespacesContextService,
  NamespaceMap, RepositoryReference, AuthenticationService, AuthenticationStorageService
} from '@ontotext/workbench-api';
import en from '../../assets/i18n/en.json';
import fr from '../../assets/i18n/fr.json';

/**
 * A component for managing test context in the application. Used only for testing
 */
@Component({
  tag: 'onto-test-context',
})
export class OntoTestContext {
  private readonly bundles = { en, fr };
  private readonly eventEmitter = new EventEmitter();

  constructor() {
    this.onLanguageChanged();
    this.setSecurityConfig({enabled: false, freeAccess: {enabled: false}} as unknown as SecurityConfig);
  }

  /**
   * Updates the license information in the context.
   *
   * This method uses the LicenseContextService to update the license
   * and returns a resolved Promise once the operation is complete.
   *
   * @param license - The new License object to be set.
   * @returns A Promise that resolves when the license update is complete.
   */
  @Method()
  updateLicense(license: License): Promise<void> {
    ServiceProvider.get(LicenseContextService).updateGraphdbLicense(license);
    return Promise.resolve();
  }

  /**
   * Updates the product information in the context.
   *
   * This method uses the ProductInfoContextService to update the product information
   * and returns a resolved Promise once the operation is complete.
   *
   * @param productInfo - The new ProductInfo object to be set.
   * @returns A Promise that resolves when the product information update is complete.
   */
  @Method()
  updateProductInfo(productInfo: ProductInfo): Promise<void> {
    ServiceProvider.get(ProductInfoContextService).updateProductInfo(productInfo);
    return Promise.resolve();
  }

  /**
   * Loads the repositories in the application.
   */
  @Method()
  loadRepositories(): Promise<void> {
    ServiceProvider.get(RepositoryService).getRepositories().then((repositories) => {
      ServiceProvider.get(RepositoryContextService).updateRepositoryList(repositories);
    });
    return Promise.resolve();
  }

  /**
   * Sets the authenticated user in the application context.
   *
   * @param user - The AuthenticatedUser object containing the user's authentication information.
   * @returns A Promise that resolves when the authenticated user has been successfully updated
   */
  @Method()
  setAuthenticatedUser(user: AuthenticatedUser): Promise<void> {
    ServiceProvider.get(SecurityContextService).updateAuthenticatedUser(
      MapperProvider.get(AuthenticatedUserMapper).mapToModel(user)
    );
    ServiceProvider.get(AuthenticationStorageService).setAuthToken('token');
    return Promise.resolve();
  }

  /**
   * Sets the security configuration in the application context.
   *
   * @param securityConfig - The SecurityConfig object containing the new security settings to be applied.
   * @returns A Promise that resolves when the security configuration has been successfully updated.
   */
  @Method()
  setSecurityConfig(securityConfig: SecurityConfig): Promise<void> {
    const config = this.createSecurityConfig(securityConfig);
    ServiceProvider.get(SecurityContextService).updateSecurityConfig(config);
    this.setAuthStrategy(config);
    return Promise.resolve();
  }

  /**
   * Logs in a user with the provided username and password.
   *
   * This method uses the AuthenticationService to perform the login operation.
   * It returns a Promise that resolves when the login process is complete.
   * @param username
   * @param password
   */
  @Method()
  login(username: string, password: string): Promise<void> {
    const authService = ServiceProvider.get(AuthenticationService);
    return authService.login(username, password);
  }

  /**
   * Changes the application's language by updating the language bundle.
   *
   * This method uses the LanguageContextService to update the language bundle
   * based on the provided language code. It retrieves the corresponding bundle
   * from the predefined bundles object and updates the context.
   *
   * @param language - The language code (e.g., 'en' for English, 'fr' for French)
   *                   representing the desired language to switch to.
   * @returns A Promise that resolves when the language update is complete.
   */
  @Method()
  changeLanguage(language: string): Promise<void> {
    ServiceProvider.get(LanguageContextService).updateLanguageBundle(this.bundles[language]);
    return Promise.resolve();
  }

  /**
   * Emits {@see NavigationEnd} event with <code>oldUrl</code> and <code>newUrl</code>.
   * @param oldUrl - the value will be used as old url in the event payload.
   * @param newUrl - the value will be used as new url in the event payload.
   */
  @Method()
  emitNavigateEndEvent(oldUrl: string, newUrl: string): Promise<void> {
    ServiceProvider.get(EventService).emit(new NavigationEnd(oldUrl, newUrl));
    return Promise.resolve();
  }

  /**
   * Updates the {@see SecurityContextService} map with <code>restrictedPages</code>.
   * @param restrictedPages - the map with restricted pages to be set in context service as new value.
   */
  @Method()
  updateRestrictedPage(restrictedPages: Record<string, boolean>): Promise<void> {
    const restriction = new RestrictedPages();
    if (!restrictedPages) {
      ServiceProvider.get(SecurityContextService).updateRestrictedPages(undefined);
      return;
    }

    Object.entries(restrictedPages).forEach(([key, value]) => {
      restriction.setPageRestriction(key, value);
    });
    ServiceProvider.get(SecurityContextService).updateRestrictedPages(restriction);
    return Promise.resolve();
  }

  /**
   * Updates the selected repository in the application context.
   *
   * @method updateSelectedRepository
   * @param repositoryReference - The RepositoryReference object representing the repository to select.
   * @returns A Promise that resolves when the selected repository has been updated.
   */
  @Method()
  updateSelectedRepository(repositoryReference: RepositoryReference): Promise<void> {
    ServiceProvider.get(RepositoryContextService).updateSelectedRepository(repositoryReference);
    return Promise.resolve();
  }

  /**
   * Updates whether the active repository request is in a loading state.
   *
   * @param isLoading - A boolean value indicating whether the repository location is in a loading state.
   *                    True indicates request is in progress, false indicates loading is complete.
   * @returns A Promise that resolves when the loading state update is complete.
   */
  @Method()
  updateIsLoadingActiveRepositoryLocation(isLoading: boolean): Promise<void> {
    ServiceProvider.get(RepositoryLocationContextService).updateIsLoading(isLoading);
    return Promise.resolve();
  }

  /**
   * Adds a toast notification to the application.
   *
   * @param toast - The ToastMessage object containing the notification details
   *                such as message content, type, and display options.
   */
  @Method()
  addToastr(toast: ToastMessage): Promise<void> {
    this.eventEmitter.emit({NAME: CREATE_TOAST_EVENT, payload: new ToastMessage(toast.type, toast.message)});
    return Promise.resolve();
  }

  /**
   * Sets the autocomplete status in the context.
   *
   * @param enabled whether autocomplete is enabled or disabled.
   */
  @Method()
  setAutocomplete(enabled: boolean): Promise<void> {
    ServiceProvider.get(AutocompleteContextService).updateAutocompleteEnabled(enabled);
    return Promise.resolve();
  }

  /**
   * Sets the namespace map in the application context.
   *
   * @param rawNamespaces - The namespace map containing prefix-to-URI mappings to be used throughout the application
   * @returns A Promise that resolves when the namespace map has been successfully updated
   */
  @Method()
  updateNamespaces(rawNamespaces: Record<string, string>): Promise<void> {
    ServiceProvider.get(NamespacesContextService).updateNamespaces(new NamespaceMap(rawNamespaces));
    return Promise.resolve();
  }

  /**
   * Sets up a listener for language changes and updates the application language accordingly.
   *
   * This private method subscribes to language change events using the LanguageContextService.
   * When a new language is selected, it calls the changeLanguage method to update the application's language.
   */
  private onLanguageChanged(): void {
    ServiceProvider.get(LanguageContextService).onSelectedLanguageChanged((languageCode) => {
      if (languageCode) {
        this.changeLanguage(languageCode);
      }
    });
  }

  /**
   * Configures the authentication strategy based on the provided security configuration.
   *
   * This private method retrieves the AuthenticationService and sets the authentication strategy
   * according to the given SecurityConfig. It ensures that the application uses the correct
   * authentication mechanism as specified in the security settings.
   *
   * @param securityConfig - The SecurityConfig object containing the security settings to be applied.
   */
  private setAuthStrategy(securityConfig: SecurityConfig): void {
    const authenticationStorageService = ServiceProvider.get(AuthenticationStorageService);
    authenticationStorageService.clearAuthToken();
    const authService = ServiceProvider.get(AuthenticationService);
    authService.setAuthenticationStrategy(securityConfig);
  }

  /**
   * Creates a SecurityConfig instance, merging default values with any provided overrides.
   *
   * This private method constructs a SecurityConfig object by combining default settings
   * with any specified overrides. It ensures that all necessary properties are set,
   * providing a complete configuration for security-related operations.
   * @param overrides
   * @private
   */
  private createSecurityConfig(overrides?: Partial<SecurityConfig>): SecurityConfig {
    const config = {
      enabled: true,
      userLoggedIn: false,
      passwordLoginEnabled: false,
      openIdEnabled: false,
      freeAccess: {},
      overrideAuth: {},
      ...overrides
    } as SecurityConfig;
    return new SecurityConfig(config);
  }
}
