import {Event} from '../event';
import {EventName} from '../event-name';
import {NavigationStartPayload} from './navigation-start-payload';

/**
 * Represents a "navigationStart" event.
 *
 * This event is triggered when navigation starts and contains information about the previous and current URLs.
 */
export class NavigationStart extends Event<NavigationStartPayload> {
  constructor(oldUrl: string, newUrl: string, cancelNavigation: () => void) {
    super(EventName.NAVIGATION_START, {oldUrl, newUrl, cancelNavigation});
  }
}
