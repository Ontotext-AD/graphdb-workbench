import {EventData} from "../models/ontotext-yasgui/event-data";
import {EventDataType} from "../models/ontotext-yasgui/event-data-type";
import {QueryRequestEvent} from "../models/ontotext-yasgui/query-request-event";
import {CountQueryResponseEvent} from "../models/ontotext-yasgui/count-query-response-event";
import {CountQueryRequestEvent} from "../models/ontotext-yasgui/count-query-request-event";
import {DownloadAsEvent} from "../models/ontotext-yasgui/download-as-event";
import {NotificationMessageEvent} from "../models/ontotext-yasgui/notification-message-event";
import {QueryExecutedEvent} from "../models/ontotext-yasgui/query-executed-event";
import {SaveQueryOpened} from "../models/ontotext-yasgui/save-query-opened";
import {RequestAbortedEvent} from "../models/ontotext-yasgui/request-aborted-event";

export const toEventData = ($event) => {
    return new EventData($event.detail.TYPE, $event.detail.payload);
};

export const toYasguiOutputModel = ($event) => {
    const eventData = toEventData($event);
    switch (eventData.TYPE) {
        case EventDataType.DOWNLOAD_AS:
            return new DownloadAsEvent(eventData);
        case EventDataType.NOTIFICATION_MESSAGE:
            return new NotificationMessageEvent(eventData);
        case EventDataType.COUNT_QUERY:
            return new CountQueryRequestEvent(eventData);
        case EventDataType.COUNT_QUERY_RESPONSE:
            return new CountQueryResponseEvent(eventData);
        case EventDataType.QUERY:
            return new QueryRequestEvent(eventData);
        case EventDataType.QUERY_EXECUTED:
            return new QueryExecutedEvent(eventData);
        case EventDataType.SAVE_QUERY_OPENED:
            return new SaveQueryOpened(eventData);
        case EventDataType.REQUEST_ABORTED:
            return new RequestAbortedEvent(eventData);
        default:
            return eventData;
    }
};

export const downloadAsFile = (filename, contentType, content) => {
    const element = document.createElement('a');
    element.setAttribute('href', `data:${contentType};charset=utf-8,${encodeURIComponent(content)}`);
    element.setAttribute('download', filename);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
};
