/**
 * Configuration for controlling YASR fullscreen behavior.
 */
export class YasrFullscreenConfig {
  /**
   * Determines whether YASR should be rendered in fullscreen mode by default when the YASGUI is initialized.
   */
  public defaultFullscreen: boolean;

  /**
   * Controls whether the Escape (ESC) key can be used to exit fullscreen mode.
   */
  public allowEscape: boolean;

  constructor(config?: Partial<YasrFullscreenConfig>) {
    this.defaultFullscreen = config?.defaultFullscreen ?? false;
    this.allowEscape = config?.allowEscape ?? true;
  }
}
