import {ContextService} from '../context';
import {ValueChangeCallback} from '../../models/context/value-change-callback';
import {RepositoryLocation} from '../../models/repository-location';
import {DeriveContextServiceContract} from '../../models/context/update-context-method';

type RepositoryLocationContextFields = {
  readonly ACTIVE_REPOSITORY_LOCATION: string;
  readonly IS_LOADING: string;
}

type RepositoryLocationContextFieldParams = {
  readonly ACTIVE_REPOSITORY_LOCATION: RepositoryLocation;
  readonly IS_LOADING: boolean;
};

/**
 * The RepositoryLocationContextService class manages the application's repository location context.
 */
export class RepositoryLocationContextService extends ContextService<RepositoryLocationContextFields> implements DeriveContextServiceContract<RepositoryLocationContextFields, RepositoryLocationContextFieldParams> {

  readonly ACTIVE_REPOSITORY_LOCATION = 'activeRepositoryLocation';
  readonly IS_LOADING = 'isLoading';

  /**
   * Updates the active repository location and notifies subscribers about the change.
   *
   * @param repositoryLocation - The repository location to set as active.
   */
  updateActiveRepositoryLocation(repositoryLocation: RepositoryLocation): void {
    this.updateContextProperty(this.ACTIVE_REPOSITORY_LOCATION, repositoryLocation);
  }

  /**
   * Registers the <code>callbackFunction</code> to be called whenever the active location changes.
   *
   * @param callbackFunction - The function to execute when the repository location changes.
   * @returns A function to unsubscribe from notifications.
   */
  onActiveLocationChanged(callbackFunction: ValueChangeCallback<RepositoryLocation | undefined>): () => void {
    return this.subscribe(this.ACTIVE_REPOSITORY_LOCATION, callbackFunction);
  }

  /**
   * Updates the loading state and notifies subscribers about the change.
   *
   * @param isLoading - The new loading state.
   */
  updateIsLoading(isLoading: boolean): void {
    this.updateContextProperty(this.IS_LOADING, isLoading);
  }

  /**
   * Registers the <code>callbackFunction</code> to be called whenever the loading state changes.
   *
   * @param callbackFunction - The function to execute when the loading state changes.
   * @returns A function to unsubscribe from notifications.
   */
  onIsLoadingChanged(callbackFunction: ValueChangeCallback<boolean | undefined>): () => void {
    return this.subscribe(this.IS_LOADING, callbackFunction);
  }
}
