import {inject, Injectable} from '@angular/core';
import {Router} from '@angular/router';
import {
  service,
  getCurrentRoute,
  REPOSITORY_ID_PARAM,
  RepositoryContextService,
  WindowService,
} from '@ontotext/workbench-api';
import {ConfirmationProviderService} from './dialog/confirmation-provider.service';
import {TranslocoService} from '@jsverse/transloco';

/**
 * This service is responsible for synchronizing the active repository in the application state with the repository
 * specified in the URL query parameter. It listens to navigation events and repository changes, and ensures that the
 * URL and the active repository are consistent. It also handles various scenarios such as missing repositories,
 * mismatches between the URL and active repository, and user confirmations for changing repositories.
 */
@Injectable({ providedIn: 'root' })
export class RepositoryUrlSyncService {
  private readonly router = inject(Router);
  private readonly confirmationProviderService = inject(ConfirmationProviderService);
  private readonly translocoService = inject(TranslocoService);

  private readonly repositoryContextService = service(RepositoryContextService);

  private isFirstResolution = true;

  /**
   * Called on every navigation event and on repository change.
   * Reads the URL param vs active repo and reconciles them. The scenarios are as follows:
   *  1. active repo no, repo in url no -> no action - just show repo selector
   *  2. active repo no, repo in url yes, url repo exists -> set active repo same as the url
   *  3. active repo no, repo in url yes, url repo missing -> show warning, keep url
   *  4. active repo yes, repo in url no -> update url
   *  5. active repo yes, repo in url yes, same repo -> do nothing
   *  6. active repo yes, repo in url yes, url repo exists and is different -> confirm change
   *  7. active repo yes, repo in url yes, url repo missing or remote -> warn and keep active repo
   */
  syncRepositoryIdWithUrl(): void {
    const repositoryIdParam = this.getRepositoryIdFromUrl();
    const selectedRepository = this.repositoryContextService.getSelectedRepository();
    // If repository exists in current or any location. The check validates by ID and location.
    const repositoryByLocationExists = this.repositoryContextService.repositoryExists({id: repositoryIdParam ?? '', location: ''});
    // If requested repository exists strictly by id and location in the system.
    const repositoryExists = repositoryIdParam ? repositoryByLocationExists : false;
    const isSameRepository = !!selectedRepository && repositoryIdParam === selectedRepository.id;

    try {
      // --- no selected repository ---

      if (!selectedRepository) {
        // 1. active repo no, repo in url no -> no action - just show repo selector
        if (!repositoryIdParam) {
          return;
        }

        // 2. active repo no, repo in url yes, url repo exists -> set active repo same as the url
        if (repositoryExists) {
          this.repositoryContextService.updateSelectedRepository({id: repositoryIdParam, location: ''});
          return;
        }

        // 3. active repo no, repo in url yes, url repo missing -> show warning, keep url
        this.confirmationProviderService.confirmOnly({
          header: this.translocoService.translate('common.warnings.warning'),
          message: this.translocoService.translate('repository.url_param.invalid_repo', {repositoryId: repositoryIdParam}),
          acceptHandler: () => {
            Promise.resolve(true);
          },
          rejectVisible: false,
        });

        return;
      }

      // --- selected repository is present ---

      // 4. active repo yes, repo in url no -> update url
      if (!repositoryIdParam) {
        this.writeRepositoryIdToUrl(selectedRepository.id);
        return;
      }

      // 5. active repo yes, repo in url yes, same repo -> do nothing
      if (isSameRepository && repositoryExists) {
        return;
      }

      // 6. active repo yes, repo in url yes, url repo exists and is different -> confirm change
      if (repositoryExists) {
        this.confirmRepositoryChange(selectedRepository.id, repositoryIdParam);
        return;
      }

      // 7. active repo yes, repo in url yes, url repo missing or on remote location -> keep active repo and fix URL
      // - If the repository doesn't exist in any location, we can safely warn the user about that and fix the URL to
      // point to the currently selected repository.
      // - Otherwise, the repository might exist on a remote location, but we can't be sure about that, because we don't
      // know the location of the repository specified in the URL. We warn the user that the repository might exist on
      // a remote location and fix the URL to point to the currently selected repository.

      // If repository id exists in any location. This check would return true for multiple repositories with the same id on different locations.
      const repositoryByIdExists = this.repositoryContextService.repositoryExists({
        id: repositoryIdParam,
        location: '',
      }, true);
      if (!repositoryByIdExists) {
        this.warnForMissingRepository(repositoryIdParam, selectedRepository.id, 'repository.url_param.invalid_repo_continue');
      } else if (this.isFirstResolution) {
        this.warnForMissingRepository(repositoryIdParam, selectedRepository.id, 'repository.url_param.remote_location_repo_continue');
      }
    } finally {
      // FIXME: probably this won't work reliably here as the service is a singleton and provided in root so this flag would be set just once
      this.isFirstResolution = false;
    }
  }

  /**
   * Called when the active repository changes — mirrors legacy's onSelectedRepositoryUpdated.
   * Writes the new repo ID to the URL without adding a history entry.
   */
  onRepositoryChanged(repositoryId: string): void {
    if (this.getRepositoryIdFromUrl() !== repositoryId) {
      this.writeRepositoryIdToUrl(repositoryId);
    }
  }

  private getRepositoryIdFromUrl(): string | undefined {
    return new URLSearchParams(WindowService.getLocationQueryParams()).get(REPOSITORY_ID_PARAM) ?? undefined;
  }

  private writeRepositoryIdToUrl(repositoryId: string): void {
    const currentParams = Object.fromEntries(new URLSearchParams(WindowService.getLocationQueryParams()));
    void this.router.navigate([getCurrentRoute()], {
      queryParams: { ...currentParams, [REPOSITORY_ID_PARAM]: repositoryId },
      replaceUrl: true,
    });
  }

  private warnForMissingRepository(repositoryIdParam: string, selectedRepository: string, messageKey: string): void {
    this.confirmationProviderService.confirmOnly({
      header: this.translocoService.translate('common.warnings.warning'),
      message: this.translocoService.translate(messageKey, {
        repositoryId: repositoryIdParam,
        currentRepositoryId: selectedRepository,
      }),
      acceptHandler: () => this.writeRepositoryIdToUrl(selectedRepository),
    });
  }

  private confirmRepositoryChange(currentId: string, newId: string): void {
    // asking user to confirm switch to newId
    this.confirmationProviderService.confirm({
      header: this.translocoService.translate('components.dialog.confirmation.title'),
      message: this.translocoService.translate('repository.url_param.change_active_repo', {repositoryId: newId}),
      acceptHandler: () => this.repositoryContextService.updateSelectedRepository({ id: newId, location: '' }),
      // revert URL param to current repo if user rejects the change
      rejectHandler: () => this.writeRepositoryIdToUrl(currentId),
    });
  }
}
