import {EventData} from "../../../models/ontotext-yasgui/event-data";
import {EventDataType} from "../../../models/ontotext-yasgui/event-data-type";

export const toYasguiOutputModel = ($event) => {
    const eventData = toEventData($event);
    switch (eventData.TYPE) {
        case EventDataType.DOWNLOAD_AS:
            return buildDownloadAsModel(eventData);
        case EventDataType.NOTIFICATION_MESSAGE:
            return buildNotificationMessageModel(eventData);
        default:
            return eventData;
    }
};

export const buildDownloadAsModel = (eventData) => {
    return {
        TYPE: eventData.TYPE,
        contentType: eventData.payload.value,
        pluginName: eventData.payload.pluginName,
        query: eventData.payload.query,
        infer: eventData.payload.infer,
        sameAs: eventData.payload.sameAs
    };
};

export const buildNotificationMessageModel = (eventData) => {
    return {
        TYPE: eventData.TYPE,
        message: eventData.payload.message,
        code: eventData.payload.code,
        messageType: eventData.payload.messageType
    };
};

export const toEventData = ($event) => {
    return new EventData($event.detail.TYPE, $event.detail.payload);
};

export const downloadAsFile = (filename, contentType, content) => {
    const element = document.createElement('a');
    element.setAttribute('href', `data:${contentType};charset=utf-8, + ${encodeURIComponent(content)}`);
    element.setAttribute('download', filename);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
};
