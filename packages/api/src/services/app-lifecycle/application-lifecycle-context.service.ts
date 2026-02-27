import {ContextService} from '../context';
import {DeriveContextServiceContract} from '../../models/context/update-context-method';
import {ValueChangeCallback} from '../../models/context/value-change-callback';
import {LifecycleState} from '../../models/app-lifecycle';
import {ApplicationStateChange} from '../../models/app-lifecycle/application-state-change';

type LifecycleDataContextFields = {
  readonly APPLICATION_DATA_STATE: string;
  readonly APPLICATION_STATE_CHANGE: string;
  readonly APPLICATION_STATE_BEFORE_CHANGE: string;
}

type LifecycleDataContextFieldParams = {
  readonly APPLICATION_DATA_STATE: LifecycleState;
  readonly APPLICATION_STATE_CHANGE: ApplicationStateChange;
  readonly APPLICATION_STATE_BEFORE_CHANGE: ApplicationStateChange;
}

/**
 * Service responsible for emitting and subscribing to application lifecycle events.
 * This service provides a centralized way to track and respond to key moments in the
 * application's lifecycle, such as when data is loaded
 */
export class ApplicationLifecycleContextService extends ContextService<LifecycleDataContextFields> implements DeriveContextServiceContract<LifecycleDataContextFields, LifecycleDataContextFieldParams> {
  readonly APPLICATION_DATA_STATE = 'applicationDataLoaded';
  readonly APPLICATION_STATE_CHANGE = 'applicationStateChange';
  readonly APPLICATION_STATE_BEFORE_CHANGE = 'applicationStateBeforeChange';

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
   * Set the application state change payload.
   */
  updateApplicationStateChange(stateChange: ApplicationStateChange): void {
    this.updateContextProperty(this.APPLICATION_STATE_CHANGE, stateChange);
  }

  /**
   * Subscribe to application state change events.
   */
  onApplicationStateChange(callbackFn: ValueChangeCallback<ApplicationStateChange | undefined>): () => void {
    return this.subscribe(this.APPLICATION_STATE_CHANGE, callbackFn);
  }

  /**
   * Set the application state before-change payload.
   */
  updateApplicationStateBeforeChange(stateChange: ApplicationStateChange): void {
    this.updateContextProperty(this.APPLICATION_STATE_BEFORE_CHANGE, stateChange);
  }

  /**
   * Subscribe to application state before-change events.
   */
  onApplicationStateBeforeChange(callbackFn: ValueChangeCallback<ApplicationStateChange | undefined>): () => void {
    return this.subscribe(this.APPLICATION_STATE_BEFORE_CHANGE, callbackFn);
  }
}
