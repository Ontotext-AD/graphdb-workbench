import {ContextService} from '../../context';
import {DeriveContextServiceContract} from '../../../models/context/update-context-method';

type GuideContextFields = {
  readonly PAUSED: string;
}

type GuideContextFieldParams = {
  readonly PAUSED: boolean;
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
}
