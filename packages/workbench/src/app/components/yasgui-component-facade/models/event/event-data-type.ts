/**
 * Holds all possible values of {@link EventData} types.
 */
export enum EventDataType {
  DOWNLOAD_AS = 'downloadAs',
  NOTIFICATION_MESSAGE = 'notificationMessage',
  QUERY = 'query',
  COUNT_QUERY = 'countQuery',
  COUNT_QUERY_RESPONSE = 'countQueryResponse',
  REQUEST_ABORTED = 'requestAborted',
  QUERY_EXECUTED = 'queryExecuted',
  SAVE_QUERY_OPENED = 'saveQueryOpened'
}
