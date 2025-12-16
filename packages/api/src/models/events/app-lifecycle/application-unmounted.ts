import {Event} from '../event';
import {EventName} from '../event-name';

/**
 * Event emitted when the application has been successfully unmounted.
 * This is our event that doesn't rely on single-spa because their events are not reliable.
 */
export class ApplicationUnmounted extends Event<undefined> {
  constructor() {
    super(EventName.APPLICATION_UNMOUNTED);
  }
}
