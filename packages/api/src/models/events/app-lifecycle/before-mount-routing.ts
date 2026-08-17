import {Event} from '../event';
import {EventName} from '../event-name';
import {ApplicationsState} from '../../app-lifecycle';

/**
 * Represents a "beforeMountRoutingEvent" event.
 *
 * This event is triggered after the routing has been resolved but before the applications affected by it are
 * mounted or unmounted. It carries the state the applications will be in once the mounting completes.
 */
export class BeforeMountRouting extends Event<ApplicationsState> {
  /**
   * Creates an instance of the BeforeMountRouting event.
   *
   * @param applicationsState - The state of the applications which are about to be mounted or unmounted.
   */
  constructor(applicationsState: ApplicationsState) {
    super(EventName.BEFORE_MOUNT_ROUTING_EVENT, applicationsState);
  }
}
