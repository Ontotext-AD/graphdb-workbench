import {Event} from '../event';
import {EventName} from '../event-name';
import {NavigationStartPayload} from './navigation-start-payload';

/**
 * Represents a "navigationStart" event.
 *
 * This event is triggered when navigation starts and contains information about the previous and current URLs.
 * To cancel the navigation, register a handler with {@link EventService.addCancellationHandler}.
 */
export class NavigationStart extends Event<NavigationStartPayload> {
  /**
   * Creates an instance of the NavigationStart event.
   *
   * @param oldUrl - The URL from which the navigation originated.
   * @param newUrl - The URL to which the navigation ended.
   */
  constructor(oldUrl: string, newUrl: string) {
    super(EventName.NAVIGATION_START, {oldUrl, newUrl});
  }
}
