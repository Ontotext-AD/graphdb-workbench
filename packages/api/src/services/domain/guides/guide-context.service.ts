import {ContextService} from '../../context';
import {DeriveContextServiceContract} from '../../../models/context/update-context-method';
import {ValueChangeCallback} from '../../../models/context/value-change-callback';
import {Repository} from '../../../models/repositories';

type GuideContextFields = {
  readonly PAUSED: string;
  readonly HAS_RUNNING_GUIDE: string;
}

type GuideContextFieldParams = {
  readonly PAUSED: boolean;
  readonly HAS_RUNNING_GUIDE: boolean;
};

/**
 * Service for managing guide context state across the application.
 */
export class GuideContextService extends ContextService<GuideContextFields> implements DeriveContextServiceContract<GuideContextFields, GuideContextFieldParams> {
  /**
   * Context property key for the paused state.
   */
  readonly PAUSED = 'isPaused';

  /**
   * Context property key indicating whether a guide is currently running.
   */
  readonly HAS_RUNNING_GUIDE = 'hasRunningGuide';

  /**
   * Updates the paused state in the context.
   *
   * @param paused - Boolean value indicating whether the guide is paused
   */
  updatePaused(paused: boolean): void {
    this.updateContextProperty(this.PAUSED, paused);
  }

  /**
   * Returns the current paused state.
   *
   * @returns The current paused state, or undefined if not set
   */
  isPaused(): boolean | undefined {
    return this.getContextPropertyValue<boolean>(this.PAUSED);
  }

  /**
   * Returns whether a guide is currently running.
   *
   * @returns `true` if a guide is currently running; otherwise, `false`.
   */
  hasRunningGuide(): boolean {
    return this.getContextPropertyValue(this.HAS_RUNNING_GUIDE) ?? false;
  }

  /**
   * Updates whether a guide is currently running.
   *
   * @param isRunning - `true` if a guide is currently running, otherwise, `false`.
   */
  updateHasRunningGuide(isRunning: boolean): void {
    this.updateContextProperty(this.HAS_RUNNING_GUIDE, isRunning);
  }

  /**
   * Registers a callback to be notified whenever the running state of the guide changes.
   *
   * @param callbackFunction - The callback invoked when the running state of the guide changes.
   * @returns A function that unsubscribes the callback from further updates.
  */
  onHasRunningGuideChanged(callbackFunction: ValueChangeCallback<Repository | undefined>): () => void {
    return this.subscribe(this.HAS_RUNNING_GUIDE, callbackFunction);
  }
}
