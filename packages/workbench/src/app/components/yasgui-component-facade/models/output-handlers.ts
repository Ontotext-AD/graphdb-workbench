import {EventDataType} from './event/event-data-type';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type OutputHandlers = Map<EventDataType, (eventData: any) => void>;
