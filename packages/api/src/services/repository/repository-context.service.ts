import {ContextService} from '../context';
import {Repository, RepositoryList} from '../../models/repositories';
import {ValueChangeCallback} from '../../models/context/value-change-callback';
import {DeriveContextServiceContract} from '../../models/context/update-context-method';
import {ServiceProvider} from '../../providers';
import {RepositoryStorageService} from './repository-storage.service';

type RepositoryContextFields = {
  readonly SELECTED_REPOSITORY_ID: string;
  readonly REPOSITORY_LIST: string;
  readonly REPOSITORY_LOCATION: string;
}

type RepositoryContextFieldParams = {
  readonly SELECTED_REPOSITORY_ID: string;
  readonly REPOSITORY_LIST: RepositoryList;
  readonly REPOSITORY_LOCATION: string;
};

/**
 * The RepositoryContextService class manages the application's repository context.
 */
export class RepositoryContextService extends ContextService<RepositoryContextFields> implements DeriveContextServiceContract<RepositoryContextFields, RepositoryContextFieldParams> {
  readonly SELECTED_REPOSITORY = 'selectedRepository';
  readonly SELECTED_REPOSITORY_ID = 'selectedRepositoryId';
  readonly REPOSITORY_LIST = 'repositoryList';
  readonly REPOSITORY_LOCATION = 'repositoryLocation';

  /**
   * Updates the selected repository ID in the context and persist it in the local storage using the storage service.
   *
   * @param selectedRepositoryId - The new repository ID.
   */
  updateSelectedRepositoryId(selectedRepositoryId: string): void {
    const storageService = ServiceProvider.get(RepositoryStorageService);
    storageService.set(this.SELECTED_REPOSITORY_ID, selectedRepositoryId);
    this.updateContextProperty(this.SELECTED_REPOSITORY_ID, selectedRepositoryId);
  }

  /**
   * Registers the <code>callbackFunction</code> to be called whenever the selected repository ID changes.
   *
   * @param callbackFunction - The function to call when the selected repository ID changes.
   * @returns A function to unsubscribe from updates.
   */
  onSelectedRepositoryIdChanged(callbackFunction: ValueChangeCallback<string | undefined>): () => void {
    return this.subscribe(this.SELECTED_REPOSITORY_ID, callbackFunction);
  }

  /**
   * Updates the selected repository and notifies subscribers about the change.
   *
   * @param selectedRepository - The new repository to set as selected.
   */
  updateSelectedRepository(selectedRepository: Repository | undefined): void {
    if (selectedRepository) {
      this.updateSelectedRepositoryId(selectedRepository.id);
    }
    this.updateContextProperty(this.SELECTED_REPOSITORY, selectedRepository);
  }

  /**
   * Registers the <code>callbackFunction</code> to be called whenever the selected repository changes.
   *
   * @param callbackFunction - The function to call when the selected repository changes.
   * @returns A function to unsubscribe from updates.
   */
  onSelectedRepositoryChanged(callbackFunction: ValueChangeCallback<Repository | undefined>): () => void {
    return this.subscribe(this.SELECTED_REPOSITORY, callbackFunction);
  }

  /**
   * Updates the repository location in the context.
   *
   * @param repositoryLocation - The new repository location.
   */
  updateRepositoryLocation(repositoryLocation: string): void {
    return this.updateContextProperty(this.REPOSITORY_LOCATION, repositoryLocation);
  }

  /**
   * Registers the <code>callbackFunction</code> to be called whenever the repository location changes.
   *
   * @param callbackFunction - The function to call when the repository location changes.
   * @returns A function to unsubscribe from updates.
   */
  onRepositoryLocationChanged(callbackFunction: ValueChangeCallback<string | undefined>): () => void {
    return this.subscribe(this.REPOSITORY_LOCATION, callbackFunction);
  }

  /**
   * Updates the list with repositories and notifies subscribers about the change.
   *
   * @param repositories - The new list with repositories.
   */
  updateRepositoryList(repositories: RepositoryList): void {
    return this.updateContextProperty(this.REPOSITORY_LIST, repositories);
  }

  /**
   *
   * Registers the <code>callbackFunction</code> to be called whenever the repository list changes.
   *
   * @param callbackFunction - The function to call when the repository list changes.
   * @returns A function to unsubscribe from updates.
   */
  onRepositoryListChanged(callbackFunction: ValueChangeCallback<RepositoryList | undefined>): () => void {
    return this.subscribe(this.REPOSITORY_LIST, callbackFunction);
  }
}
