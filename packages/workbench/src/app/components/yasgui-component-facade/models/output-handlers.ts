import {EventDataType} from './event/event-data-type';
import {DownloadAsEvent} from './event/download-as-event';
import {NotificationMessageEvent} from './event/notification-message-event';
import {CountQueryRequestEvent} from './event/count-query-request-event';
import {CountQueryResponseEvent} from './event/count-query-response-event';
import {QueryRequestEvent} from './event/query-request-event';
import {QueryExecutedEvent} from './event/query-executed-event';
import {SaveQueryOpened} from './event/save-query-opened';
import {RequestAbortedEvent} from './event/request-aborted-event';

// Maps each EventDataType literal to its concrete event class
export interface EventTypeMap {
  [EventDataType.DOWNLOAD_AS]: DownloadAsEvent;
  [EventDataType.NOTIFICATION_MESSAGE]: NotificationMessageEvent;
  [EventDataType.QUERY]: QueryRequestEvent;
  [EventDataType.COUNT_QUERY]: CountQueryRequestEvent;
  [EventDataType.COUNT_QUERY_RESPONSE]: CountQueryResponseEvent;
  [EventDataType.REQUEST_ABORTED]: RequestAbortedEvent;
  [EventDataType.QUERY_EXECUTED]: QueryExecutedEvent;
  [EventDataType.SAVE_QUERY_OPENED]: SaveQueryOpened;
}

// Partial because not all events need a handler
export type OutputHandlers = {
  [K in keyof EventTypeMap]?: (event: EventTypeMap[K]) => void;
};
