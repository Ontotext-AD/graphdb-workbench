/**
 * Configuration for controlling YASR fullscreen behavior.
 */
export class YasrFullscreenConfig {
    /**
     * Determines whether YASR should be rendered in fullscreen mode by default when the YASGUI is initialized.
     */
    defaultFullscreen = false;

    /**
     * Controls whether the Escape (ESC) key can be used to exit fullscreen mode.
     */
    allowEscape = true;
}
