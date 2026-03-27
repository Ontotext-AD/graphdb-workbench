import {LocalStorageService} from '../../storage';
import {LoggerProvider} from '../../logging/logger-provider';

/**
 * Service for managing SPARQL editor related data in local storage.
 */
export class SparqlStorageService extends LocalStorageService {
  readonly NAMESPACE = 'sparqlEditor';
  private readonly logger = LoggerProvider.logger;

  /**
   * Key for storing the last used in the editor repository. This is used to pre-select the repository in the editor
   * when the user opens it again.
   */
  readonly LAST_USED_REPOSITORY = 'lastUsedRepository';
  /**
   * Legacy key for storing the last used repository. This is used to migrate data from older versions of the
   * application that used a different key for this data.
   */
  private readonly LEGACY_LAST_USED_REPOSITORY_KEY = 'ls.sparql-last-repo';

  set(key: string, value: string) {
    this.storeValue(key, value);
  }

  setLastUsedRepository(repositoryId: string): void {
    this.set(this.LAST_USED_REPOSITORY, repositoryId);
  }

  getLastUsedRepository(): string | null {
    this.migrateLastUsedRepositoryKey();
    return this.get(this.LAST_USED_REPOSITORY).getValue();
  }

  private migrateLastUsedRepositoryKey(): void {
    const legacyData = this.get(this.LEGACY_LAST_USED_REPOSITORY_KEY, false).getValue();
    if (legacyData) {
      this.logger.info('Legacy last used repository data found. Migrating to new key.', {legacyData});
      this.setLastUsedRepository(legacyData);
      this.remove(this.LEGACY_LAST_USED_REPOSITORY_KEY, false);
    }
  }
}
