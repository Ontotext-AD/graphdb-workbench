import {Event} from '../event';
import {EventName} from '../event-name';

export class ApplicationChanged extends Event<undefined> {
  constructor() {
    super(EventName.APPLICATION_CHANGED);
  }
}
