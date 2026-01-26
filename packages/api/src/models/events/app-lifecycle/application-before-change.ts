import {Event} from '../event';
import {EventName} from '../event-name';

export class ApplicationBeforeChange extends Event<undefined> {
  constructor() {
    super(EventName.APPLICATION_BEFORE_CHANGE);
  }
}
