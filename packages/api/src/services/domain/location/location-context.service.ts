import {ContextService} from '../../context';
import {ValueChangeCallback} from '../../../models/context/value-change-callback';
import {Location} from '../../../models/location';
import {DeriveContextServiceContract} from '../../../models/context/update-context-method';
import {LifecycleHooks} from '../../../providers/service/lifecycle-hooks';

type LocationContextFields = {
  readonly ACTIVE_LOCATION: string;
  readonly IS_LOADING: string;
}

type LocationContextFieldParams = {
  readonly ACTIVE_LOCATION: Location;
  readonly IS_LOADING: boolean;
};

/**
 * The LocationContextService class manages the application's location context.
 */
export class LocationContextService extends ContextService<LocationContextFields> implements DeriveContextServiceContract<LocationContextFields, LocationContextFieldParams>, LifecycleHooks {

  readonly ACTIVE_LOCATION = 'activeLocation';
  readonly IS_LOADING = 'isLoading';

  /**
   * Updates the active location and notifies subscribers about the change.
   *
   * @param location - The location to set as active.
   */
  updateActiveLocation(location: Location): void {
    this.updateContextProperty(this.ACTIVE_LOCATION, location);
  }

  /**
   * Registers the <code>callbackFunction</code> to be called whenever the active location changes.
   *
   * @param callbackFunction - The function to execute when the location changes.
   * @returns A function to unsubscribe from notifications.
   */
  onActiveLocationChanged(callbackFunction: ValueChangeCallback<Location | undefined>): () => void {
    return this.subscribe(this.ACTIVE_LOCATION, callbackFunction);
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
