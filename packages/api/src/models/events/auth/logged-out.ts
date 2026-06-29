import {Event} from '../event';
import {EventName} from '../event-name';

/**
 * Represents a "loggedOut" event.
 *
 * This event is triggered when users logged out.
 */
export class LoggedOut extends Event<undefined> {
  constructor() {
    super(EventName.LOGGED_OUT);
  }
}
