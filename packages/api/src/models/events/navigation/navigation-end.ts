import {Event} from '../event';
import {NavigationEndPayload} from './navigation-end-payload';
import {EventName} from '../event-name';

/**
 * Represents a "navigationEnd" event.
 *
 * This event is triggered when navigation ends and contains information about the previous and current URLs.
 */
export class NavigationEnd extends Event<NavigationEndPayload> {
  constructor(oldUrl: string, newUrl: string) {
    super(EventName.NAVIGATION_END, {oldUrl, newUrl});
  }
}
