import {EventDataType} from './event/event-data-type';

export type OutputHandlers = Map<EventDataType, (eventData: never) => void>;
