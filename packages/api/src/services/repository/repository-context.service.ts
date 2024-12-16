import {ContextService} from '../context/context.service';
import {Repository, RepositoryList} from '../../models/repositories';
import {ValueChangeCallback} from '../../models/context/value-change-callback';

/**
 * The RepositoryContextService class manages the application's repository context.
 */
export class RepositoryContextService extends ContextService {

  private static readonly UPDATE_SELECTED_REPOSITORY = 'selectedRepository';
  private static readonly UPDATE_REPOSITORY_LIST = 'repositoryList';

  /**
   * Updates the selected repository and notifies subscribers about the change.
   *
   * @param repository - The new repository to set as selected.
   */
  updateSelectedRepository(repository: Repository | undefined): void {
    this.updateContextProperty(RepositoryContextService.UPDATE_SELECTED_REPOSITORY, repository);
  }

  /**
   * Registers the <code>callbackFunction</code> to be called whenever the selected repository changes.
   *
   * @param callbackFunction - The function to call when the selected repository changes.
   * @returns A function to unsubscribe from updates.
   */
  onSelectedRepositoryChanged(callbackFunction: ValueChangeCallback<Repository | undefined>): () => void {
    return this.subscribe(RepositoryContextService.UPDATE_SELECTED_REPOSITORY, callbackFunction);
  }

  /**
   * Updates the lsit with repositories and notifies subscribers about the change.
   *
   * @param repositories - The new list with repositories.
   */
  updateRepositories(repositories: RepositoryList): void {
    return this.updateContextProperty(RepositoryContextService.UPDATE_REPOSITORY_LIST, repositories);
  }

  /**
   *
   * Registers the <code>callbackFunction</code> to be called whenever the repository list changes.
   *
   * @param callbackFunction - The function to call when the repository list changes.
   * @returns A function to unsubscribe from updates.
   */
  onRepositoriesChanged(callbackFunction: ValueChangeCallback<RepositoryList | undefined>): () => void {
    return this.subscribe(RepositoryContextService.UPDATE_REPOSITORY_LIST, callbackFunction);
  }
}
