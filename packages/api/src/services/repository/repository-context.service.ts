import {ContextService} from '../context';
import {Repository, RepositoryList} from '../../models/repositories';
import {ValueChangeCallback} from '../../models/context/value-change-callback';
import {DeriveContextServiceContract} from '../../models/context/update-context-method';

type RepositoryContextFields = {
  readonly SELECTED_REPOSITORY: string;
  readonly REPOSITORY_LIST: string;
}

type RepositoryContextFieldParams = {
  readonly SELECTED_REPOSITORY: Repository;
  readonly REPOSITORY_LIST: RepositoryList;
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
   * @param repository - The new repository to set as selected.
   */
  updateSelectedRepository(repository: Repository | undefined): void {
    this.updateContextProperty(this.SELECTED_REPOSITORY, repository);
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
  onRepositoriesChanged(callbackFunction: ValueChangeCallback<RepositoryList | undefined>): () => void {
    return this.subscribe(this.REPOSITORY_LIST, callbackFunction);
  }
}
