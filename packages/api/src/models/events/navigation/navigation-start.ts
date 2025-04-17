import {Event} from '../event';
import {EventName} from '../event-name';
import {NavigationStartPayload} from './navigation-start-payload';

/**
 * Represents a "navigationStart" event.
 *
 * This event is triggered when navigation starts and contains information about the previous and current URLs.
 */
export class NavigationStart extends Event<NavigationStartPayload> {
  /**
   * Creates an instance of the NavigationStart event.
   *
   * @param oldUrl - The URL from which the navigation originated.
   * @param newUrl - The URL to which the navigation ended.
   * @param cancelNavigation - A function to cancel the ongoing navigation.
   */
  constructor(oldUrl: string, newUrl: string, cancelNavigation: (cancellationPayload: unknown) => void) {
    super(EventName.NAVIGATION_START, {oldUrl, newUrl, cancelNavigation});
  }
}
