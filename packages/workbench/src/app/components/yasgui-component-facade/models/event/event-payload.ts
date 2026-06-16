import { Tab } from '../yasgui/yasgui';
import { QueryRequest } from '../query-request';
import { QueryResponse } from '../query-response';

/**
 * Represents the payload of an event emitted by the YasguiComponentFacade.
 */
export interface EventPayload {}

/**
 * Represents the payload of an event emitted by "ontotext-yasgui-web-component"
 * when the Abort Query button is clicked.
 */
export interface RequestAbortedEventPayload extends EventPayload {
  request: {
    headers: Record<string, string>;
    url: string;
    queryType: string;
  };
  queryMode: string;
}

/**
 * Represents the payload of an event of type {@link EventDataType.SAVE_QUERY_OPENED}
 * emitted by "ontotext-yasgui-web-component" when a saved query is opened in a tab.
 */
export interface SaveQueryOpenedEventPayload extends EventPayload {
  tab: Tab;
}

/**
 * Represents the payload of an event of type {@link EventDataType.QUERY_EXECUTED}
 * emitted by "ontotext-yasgui-web-component" when a query is executed.
 */
export interface QueryExecutedEventPayload extends EventPayload {
  duration: number;
  tabId: string;
}

/**
 * Represents the payload of an event of type {@link EventDataType.QUERY}
 * emitted by "ontotext-yasgui-web-component" when a query is executed.
 *
 * Holds the request, which must be updated with additional information such as
 * the repository ID and location.
 */
export interface QueryRequestEventPayload extends EventPayload {
  query: string;
  queryMode: string;
  queryType: string;
  pageSize: number;
  request: QueryRequest;
}

/**
 * Represents the payload of an event of type {@link EventDataType.COUNT_QUERY_RESPONSE}
 * emitted by "ontotext-yasgui-web-component" when a count query has been executed.
 *
 * Holds the response of the count query, which must be processed to extract
 * the total number of results.
 */
export interface CountQueryResponseEventPayload extends EventPayload {
  response: QueryResponse;
}

/**
 * Represents the payload of an event of type {@link EventDataType.COUNT_QUERY}
 * emitted by "ontotext-yasgui-web-component" when a count query is executed.
 *
 * The count query is executed to retrieve the total number of results when the
 * actual result set contains more results than those currently displayed in YASR.
 */
export interface CountQueryRequestEventPayload extends EventPayload {
  query: string;
  queryMode: string;
  queryType: string;
  pageSize: number;
  request: QueryRequest;
}

/**
 * Represents the payload of an event of type {@link EventDataType.NOTIFICATION_MESSAGE}
 * emitted by "ontotext-yasgui-web-component" when a notification message needs to be displayed.
 */
export interface NotificationMessageEventPayload extends EventPayload {
  message: string;
  code: string;
  messageType: string;
}

/**
 * Represents the payload of an event of type {@link EventDataType.DOWNLOAD_AS}
 * emitted by "ontotext-yasgui-web-component" when the Download As button is clicked.
 */
export interface DownloadAsEventPayload extends EventPayload {
  value: string;
  pluginName: string;
  query: string;
  infer: boolean;
  sameAs: boolean;
}
