/**
 * All possible rendering modes for the YASGUI component.
 */
export enum RenderingMode {
  /**
   * The default rendering mode, which includes the query editor and the result viewer in a vertical orientation.
   */
  YASGUI = 'mode-yasgui',
  /**
   * Only the query editor is rendered, without the result viewer.
   */
  YASQE = 'mode-yasqe',
  /**
   * Only the result viewer is rendered, without the query editor.
   */
  YASR = 'mode-yasr'
}
