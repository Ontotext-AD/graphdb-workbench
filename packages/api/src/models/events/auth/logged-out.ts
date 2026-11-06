import {Event} from '../event';
import {EventName} from '../event-name';

/**
 * Represents an {@link EventName.LOGGED_OUT} event.
 *
 * This event is triggered when user logged out.
 */
export class LoggedOut extends Event<undefined> {
  constructor() {
    super(EventName.LOGGED_OUT);
  }
}
