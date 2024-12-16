import {ContextService} from '../context/context.service';
import {ValueChangeCallback} from '../../models/context/value-change-callback';
import {RepositoryLocation} from '../../models/repository-location';

/**
 * The RepositoryLocationContextService class manages the application's repository location context.
 */
export class RepositoryLocationContextService extends ContextService {

  private static readonly ACTIVE_REPOSITORY_LOCATION = 'activeRepositoryLocation';

  /**
   * Updates the active repository location and notifies subscribers about the change.
   *
   * @param repositoryLocation - The repository location to set as active.
   */
  updateActiveLocation(repositoryLocation: RepositoryLocation): void {
    this.updateContextProperty(RepositoryLocationContextService.ACTIVE_REPOSITORY_LOCATION, repositoryLocation);
  }

  /**
   * Registers the <code>callbackFunction</code> to be called whenever the active location changes.
   *
   * @param callbackFunction - The function to execute when the repository location changes.
   * @returns A function to unsubscribe from notifications.
   */
  onActiveLocationChanged(callbackFunction: ValueChangeCallback<RepositoryLocation | undefined>): () => void {
    return this.subscribe(RepositoryLocationContextService.ACTIVE_REPOSITORY_LOCATION, callbackFunction);
  }
}
