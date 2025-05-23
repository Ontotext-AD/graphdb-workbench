import {Event} from '../event';
import {EventName} from '../event-name';

/**
 * Represents a "logout" event.
 *
 * This event is triggered when users attempts to log out.
 */
export class Logout extends Event<undefined> {
  constructor() {
    super(EventName.LOGOUT);
  }
}
