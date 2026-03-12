import {LocalStorageService} from '../../storage';

type GuideAutostartState = Record<string, { disabled: boolean }>;

/**
 * Service that handles the guide-related properties in the local storage.
 * Manages guide state persistence including current step, step history, pause state, and autostart preferences.
 */
export class GuideStorageService extends LocalStorageService {
  readonly NAMESPACE = 'guides';

  private readonly GUIDE_ID = 'guide_id';
  private readonly CURRENT_STEP_ID = 'guide.current.step.id';
  private readonly STEP_HISTORY = 'guide.step.history';
  private readonly PAUSE = 'guide.pause';
  private readonly AUTOSTART = 'guides.autostart';

  set(key: string, value: string): void {
    this.storeValue(key, value);
  }

  /**
   * Returns the ID of the currently active guide.
   */
  getGuideId(): string | null {
    return this.get(this.GUIDE_ID).getValue();
  }

  /**
   * Stores the ID of the currently active guide.
   * @param guideId - The guide ID to persist.
   */
  setGuideId(guideId: string): void {
    this.set(this.GUIDE_ID, guideId);
  }

  /**
   * Returns the ID of the current step in the active guide.
   */
  getCurrentStepId(): string | null {
    return this.get(this.CURRENT_STEP_ID).getValue();
  }

  /**
   * Stores the ID of the current step.
   * @param stepId - The step ID to persist.
   */
  setCurrentStepId(stepId: string): void {
    this.set(this.CURRENT_STEP_ID, stepId);
  }

  /**
   * Returns the step history as an array of step IDs.
   */
  getHistory(): string[] {
    const data = this.get(this.STEP_HISTORY).getAsJson();
    return Array.isArray(data) ? data : [];
  }

  /**
   * Adds a step ID to the end of the step history.
   * @param stepId - The step ID to append.
   */
  addStepToHistory(stepId: string): void {
    const history = this.getHistory();
    history.push(stepId);
    this.set(this.STEP_HISTORY, JSON.stringify(history));
  }

  /**
   * Removes the last step ID from the step history.
   */
  removeLastStepFromHistory(): void {
    const history = this.getHistory();
    history.pop();
    this.set(this.STEP_HISTORY, JSON.stringify(history));
  }

  /**
   * Returns the previous step ID from the history relative to the given step ID.
   * If no step ID is provided, returns the second-to-last entry in the history.
   *
   * @param stepId - Optional step ID to find the predecessor of.
   * @returns The previous step ID, or `undefined` if there is no previous step.
   */
  getPreviousStepIdFromHistory(stepId?: string): string | undefined {
    const history = this.getHistory();
    if (stepId) {
      const index = history.indexOf(stepId);
      return index > 0 ? history[index - 1] : undefined;
    }
    return history.length > 1 ? history.at(-2) : undefined;
  }

  /**
   * Clears the step history.
   */
  clearHistory(): void {
    this.remove(this.STEP_HISTORY);
  }

  /**
   * Returns whether the guide is currently paused.
   */
  isPaused(): boolean {
    return this.get(this.PAUSE).getValue() === 'true';
  }

  /**
   * Marks the guide as paused.
   */
  setPaused(): void {
    this.set(this.PAUSE, 'true');
  }

  /**
   * Clears the pause state.
   */
  clearPaused(): void {
    this.remove(this.PAUSE);
  }

  /**
   * Persists the current guide and step IDs so the guide can be resumed later.
   * @param guideId - The guide ID.
   * @param stepId - The current step ID.
   */
  saveStep(guideId: string, stepId: string): void {
    this.setGuideId(guideId);
    this.setCurrentStepId(stepId);
  }

  /**
   * Returns whether autostart is disabled for the given guide.
   * @param guideId - The guide ID to check.
   */
  isAutostartDisabled(guideId: string): boolean {
    const state = this.get(this.AUTOSTART).getAsJson() as GuideAutostartState | null;
    return !!state?.[guideId]?.disabled;
  }

  /**
   * Disables autostart for the given guide.
   * @param guideId - The guide ID for which to disable autostart.
   */
  disableAutostart(guideId: string): void {
    const state = (this.get(this.AUTOSTART).getAsJson() as GuideAutostartState) || {};
    state[guideId] = {disabled: true};
    this.set(this.AUTOSTART, JSON.stringify(state));
  }

  /**
   * Removes all guide-related data from local storage.
   */
  clearAll(): void {
    this.remove(this.GUIDE_ID);
    this.remove(this.PAUSE);
    this.remove(this.CURRENT_STEP_ID);
    this.remove(this.STEP_HISTORY);
  }
}

