/**
 * Represents the payload for a navigation start event.
 */
export class NavigationStartPayload {
  
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
  
  cancelNavigation = (event: unknown) => {
    // @ts-ignore
    event.preventDefault();
  }
}
