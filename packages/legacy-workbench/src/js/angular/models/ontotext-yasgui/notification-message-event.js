/**
 * Model for event of type {@link EventDataType.NOTIFICATION_MESSAGE} emitted by "ontotext-yasgui-web-component".
 */
export class NotificationMessageEvent {

    /**
     * Constructs the model for {@link EventDataType.NOTIFICATION_MESSAGE} event.
     *
     * @param {EventData} eventData - event emitted by "ontotext-yasgui-web-component".
     */
    constructor(eventData) {
        this.TYPE = eventData.TYPE;
        this.message = eventData.payload.message;
        this.code = eventData.payload.code;
        this.messageType = eventData.payload.messageType;
    }
}
