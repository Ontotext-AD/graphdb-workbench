/**
 * Represents the payload for a navigation start event.
 */
export interface NavigationStartPayload {
  
  /**
   * The URL from which the navigation originated.
   *
   * @type {string | undefined}
   */
  oldUrl: string | undefined;
  
  /**
   * The URL to which the navigation ended.
   *
   * @type {string | undefined}
   */
  newUrl: string | undefined;
  
  /**
   * Cancels the ongoing navigation.
   *
   * @param cancellationPayload - The payload required to cancel the navigation.
   * This depends on the navigation implementation. For example, in Angular it can be a native or custom event,
   * while in single-spa it can be boolean or a Promise whose result determines whether the navigation is canceled.
   */
  cancelNavigation: (cancellationPayload: unknown) => void
}
