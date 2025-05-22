import {ContextService} from '../context';
import {Repository, RepositoryList, RepositoryReference} from '../../models/repositories';
import {ValueChangeCallback} from '../../models/context/value-change-callback';
import {DeriveContextServiceContract} from '../../models/context/update-context-method';
import {ServiceProvider} from '../../providers';
import {RepositoryStorageService} from './repository-storage.service';
import {BeforeChangeValidationPromise} from '../../models/context/before-change-validation-promise';

type RepositoryContextFields = {
  readonly REPOSITORY_LIST: string;
  readonly SELECTED_REPOSITORY: string;
}

type RepositoryContextFieldParams = {
  readonly REPOSITORY_LIST: RepositoryList;
  readonly SELECTED_REPOSITORY: RepositoryReference;
};

/**
 * The RepositoryContextService class manages the application's repository context.
 */
export class RepositoryContextService extends ContextService<RepositoryContextFields> implements DeriveContextServiceContract<RepositoryContextFields, RepositoryContextFieldParams> {
  readonly SELECTED_REPOSITORY = 'selectedRepository';
  readonly REPOSITORY_LIST = 'repositoryList';

  /**
   * Updates the selected repository and notifies subscribers about the change.
   *
   * @param [repositoryReference] - The new repository to set as selected. Optional.
   */
  updateSelectedRepository(repositoryReference?: RepositoryReference): void {
    const storageService = ServiceProvider.get(RepositoryStorageService);
    const selectedRepository = this.findRepository(repositoryReference);

    this.validatePropertyChange(this.SELECTED_REPOSITORY, selectedRepository)
      .then((canChange) => {
        if (canChange) {
          if (selectedRepository) {
            storageService.setRepositoryReference(selectedRepository);
          } else if (!repositoryReference) {
            storageService.removeRepositoryReference();
          }
          this.updateContextProperty(this.SELECTED_REPOSITORY, selectedRepository);
        }
      });
  }

  /**
   * Retrieves the currently selected repository.
   */
  getSelectedRepository(): Repository | undefined {
    return this.getContextPropertyValue(this.SELECTED_REPOSITORY);
  }

  /**
   * Registers the <code>callbackFunction</code> to be called whenever the selected repository changes.
   *
   * @param callbackFunction - The function to call when the selected repository changes.
   * @param beforeChangeValidationPromise - Optional. A promise that will be resolved before
   *        the repository change is applied. This can be used to validate or prepare for the
   *        repository change. If the promise is resolved with false or rejects, the repository change will be canceled.
   * @returns A function to unsubscribe from updates.
   */
  onSelectedRepositoryChanged(callbackFunction: ValueChangeCallback<Repository | undefined>, beforeChangeValidationPromise?: BeforeChangeValidationPromise<Repository | undefined>): () => void {
    return this.subscribe(this.SELECTED_REPOSITORY, callbackFunction, beforeChangeValidationPromise);
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
   * Retrieves the list of repositories from the current context.
   *
   * @returns {RepositoryList} The list of repositories. Returns an empty RepositoryList if none is found.
   */
  getRepositoryList(): RepositoryList {
    return this.getContextPropertyValue(this.REPOSITORY_LIST) || new RepositoryList([]);
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

  /**
   * Finds and returns a repository matching the given repository reference.
   *
   * @param {RepositoryReference} repositoryReference - The reference containing `id` and `location` to identify the repository.
   * @returns {Repository | undefined} The matching repository if found; otherwise, undefined.
   */
  private findRepository(repositoryReference?: RepositoryReference): Repository | undefined {
    if (!repositoryReference) {
      return undefined;
    }
    return this.getRepositoryList().findRepository(repositoryReference.id, repositoryReference.location);
  }
}
