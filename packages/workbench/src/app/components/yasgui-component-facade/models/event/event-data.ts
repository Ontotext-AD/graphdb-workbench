import {EventPayload} from './event-payload';
import {EventDataType} from './event-data-type';

/**
 * Model of all events fired by "ontotext-yasgui".
 */
export class EventData {
  constructor(
    public type: EventDataType,
    public payload: EventPayload
  ) {}
}
