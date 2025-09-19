import {Event} from '../event';
import {EventName} from '../event-name';

/**
 * Represents a "login" event.
 *
 * This event is triggered when users logs in.
 */
export class Login extends Event<undefined> {
  constructor() {
    super(EventName.LOGIN);
  }
}
