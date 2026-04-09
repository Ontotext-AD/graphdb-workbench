import {EventDataType} from './event-data-type';
import {EventPayload} from './event-payload';
import {DownloadAsEvent} from './download-as-event';
import {NotificationMessageEvent} from './notification-message-event';
import {CountQueryRequestEvent} from './count-query-request-event';
import {CountQueryResponseEvent} from './count-query-response-event';
import {QueryRequestEvent} from './query-request-event';
import {QueryExecutedEvent} from './query-executed-event';
import {SaveQueryOpened} from './save-query-opened';
import {RequestAbortedEvent} from './request-aborted-event';

/**
 * This interface represents a custom event emitted by the Yasgui component in the Ontotext Workbench application.
 */
export interface OntotextYasguiEvent extends CustomEvent {
  type: EventDataType;
  payload: EventPayload;
}

/**
 * This type represents all possible events that can be emitted by the Yasgui component.
 */
export type YasguiOutputEvent =
  | DownloadAsEvent
  | NotificationMessageEvent
  | CountQueryRequestEvent
  | CountQueryResponseEvent
  | QueryRequestEvent
  | QueryExecutedEvent
  | SaveQueryOpened
  | RequestAbortedEvent;
