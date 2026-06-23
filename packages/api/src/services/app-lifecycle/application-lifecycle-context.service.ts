import {ContextService} from '../context';
import {DeriveContextServiceContract} from '../../models/context/update-context-method';
import {ValueChangeCallback} from '../../models/context/value-change-callback';
import {LifecycleState, ApplicationsState} from '../../models/app-lifecycle';

type LifecycleDataContextFields = {
  readonly APPLICATION_DATA_STATE: string;
  readonly APPLICATIONS_STATE: string;
  readonly APPLICATIONS_STATE_BEFORE_CHANGE: string;
  readonly NAVIGATION_BEFORE_MOUNT_ROUTING: string;
}

type LifecycleDataContextFieldParams = {
  readonly APPLICATION_DATA_STATE: LifecycleState;
  readonly APPLICATIONS_STATE: ApplicationsState;
  readonly APPLICATIONS_STATE_BEFORE_CHANGE: ApplicationsState;
  readonly NAVIGATION_BEFORE_MOUNT_ROUTING: ApplicationsState;
}

/**
 * Service responsible for emitting and subscribing to application lifecycle events.
 * This service provides a centralized way to track and respond to key moments in the
 * application's lifecycle, such as when data is loaded
 */
export class ApplicationLifecycleContextService extends ContextService<LifecycleDataContextFields> implements DeriveContextServiceContract<LifecycleDataContextFields, LifecycleDataContextFieldParams> {
  readonly APPLICATION_DATA_STATE = 'applicationDataLoaded';
  readonly APPLICATIONS_STATE = 'applicationsState';
  readonly APPLICATIONS_STATE_BEFORE_CHANGE = 'applicationsStateBeforeChange';
  readonly NAVIGATION_BEFORE_MOUNT_ROUTING = 'navigationBeforeMountRouting';

  /**
   * Updates the application data state in the context.
   *
   * @param state - The lifecycle state to set for the application data
   * @returns void
   */
  updateApplicationDataState(state: LifecycleState): void {
    this.updateContextProperty(this.APPLICATION_DATA_STATE, state);
  }

  /**
   * Registers a callback function to be invoked when the application data state changes.
   *
   * @param callbackFn - The function to be called when the application data state changes.
   *                     The function will receive the new state value as its parameter.
   * @returns A function that, when called, will unsubscribe the callback from further notifications
   */
  onApplicationDataStateChanged(callbackFn: ValueChangeCallback<LifecycleState | undefined>): () => void {
    return this.subscribe(this.APPLICATION_DATA_STATE, callbackFn);
  }

  /**
   * Retrieves the current application data state from the context.
   *
   * @returns The current lifecycle state of the application data, or undefined if not set
   */
  getApplicationDataState(): LifecycleState | undefined {
    return this.getContextPropertyValue(this.APPLICATION_DATA_STATE);
  }

  /**
   * Updates the applications state in the context.
   * @param applicationsState - The new applications state to set in the context.
   */
  updateApplicationsState(applicationsState: ApplicationsState): void {
    this.updateContextProperty(this.APPLICATIONS_STATE, applicationsState);
  }

  /**
   * Registers a callback function to be invoked when the applications state changes.
   * @param callbackFn - The function to be called when the applications state changes.
   *                     The function will receive the new applications state as its parameter.
   * @returns A function that, when called, will unsubscribe the callback from further notifications.
   */
  onApplicationsStateChanged(callbackFn: ValueChangeCallback<ApplicationsState | undefined>): () => void {
    return this.subscribe(this.APPLICATIONS_STATE, callbackFn);
  }

  /**
   * Retrieves the current applications state from the context.
   * @returns The current applications state, or undefined if not set.
   */
  getApplicationsState(): ApplicationsState | undefined {
    return this.getContextPropertyValue(this.APPLICATIONS_STATE);
  }

  /**
   * Updates the applications state before-change in the context.
   * @param applicationsState - The new applications state before-change to set in the context.
   */
  updateApplicationsStateBeforeChange(applicationsState: ApplicationsState): void {
    this.updateContextProperty(this.APPLICATIONS_STATE_BEFORE_CHANGE, applicationsState);
  }

  /**
   * Registers a callback function to be invoked when the applications state before-change changes.
   * @param callbackFn - The function to be called when the applications state before-change changes.
   *                     The function will receive the new applications state before-change as its parameter.
   * @returns A function that, when called, will unsubscribe the callback from further notifications.
   */
  onApplicationsStateBeforeChange(callbackFn: ValueChangeCallback<ApplicationsState | undefined>): () => void {
    return this.subscribe(this.APPLICATIONS_STATE_BEFORE_CHANGE, callbackFn);
  }

  /**
   * Set the application state before-mount-routing payload.
   */
  updateNavigationBeforeMountRouting(payload: ApplicationsState): void {
    this.updateContextProperty(this.NAVIGATION_BEFORE_MOUNT_ROUTING, payload);
  }

  /**
   * Subscribe to application state before-mount-routing events.
   */
  onNavigationBeforeMountRouting(callbackFn: ValueChangeCallback<ApplicationsState | undefined>, skipFirst = false): () => void {
    return this.subscribe(this.NAVIGATION_BEFORE_MOUNT_ROUTING, callbackFn, undefined, undefined, skipFirst);
  }
}
