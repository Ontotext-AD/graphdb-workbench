/**
 * The payload of an event emitted by the YasguiComponentFacade.
 * It contains the duration of the event and the ID of the tab where the event occurred.
 */
export class EventPayload {
  constructor(
    public duration: number,
    public tabId: string,
  ) {
  }
}
