/**
 * Configuration flags for controlling which parts of the YASGUI component should be reset.
 */
export class YasguiResetFlags {
  /**
   * If true, resets the currently active tab to its default state.
   */
  resetCurrentTab: boolean;

  /**
   * If true, resets the "infer results" option to its default value.
   */
  resetInferResults: boolean;

  /**
   * If true, resets the "sameAs" option to its default value.
   */
  resetSameAs: boolean;

  /**
   * If true, resets the YASR (result viewer) component to its default state.
   */
  resetYasr: boolean;

  /**
   * Creates a new YasguiResetFlags instance.
   * @param resetCurrentTab - Whether to reset the current tab
   * @param inferResults - Whether to reset the infer results option
   * @param enableSameAs - Whether to reset the sameAs option
   * @param resetYasr - Whether to reset the YASR component
   */
  constructor(
    resetCurrentTab = false,
    inferResults = false,
    enableSameAs = false,
    resetYasr = false
  ) {
    this.resetCurrentTab = resetCurrentTab;
    this.resetInferResults = inferResults;
    this.resetSameAs = enableSameAs;
    this.resetYasr = resetYasr;
  }
}
