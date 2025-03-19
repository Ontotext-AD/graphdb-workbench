import {Component, Method} from '@stencil/core';
import {
  EventService,
  AuthenticatedUser,
  AuthenticatedUserMapper,
  LanguageContextService,
  License,
  LicenseContextService, NavigationEnd,
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
  CREATE_TOAST_EVENT
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
    ServiceProvider.get(SecurityContextService).updateSecurityConfig(securityConfig);
    return Promise.resolve();
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
   * Updates the selected repository ID in the application context to navigate to operations status summary.
   *
   * @param repoId - The ID of the repository to select for viewing operations status summary.
   * @returns A Promise that resolves when the repository ID has been successfully updated.
   */
  @Method()
  updateSelectedRepositoryId(repoId: string): Promise<void> {
    ServiceProvider.get(RepositoryContextService).updateSelectedRepositoryId(repoId);
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
}
