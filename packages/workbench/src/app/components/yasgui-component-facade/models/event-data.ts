import {EventPayload} from './event-payload';

/**
 * Model of all events fired by "ontotext-yasgui".
 */
export class EventData {
  constructor(
    public TYPE: string,
    public payload: EventPayload
  ) {}
}
