/**
 * The payload of an event emitted by the YasguiComponentFacade.
 */
export class EventPayload {
  constructor(
    public duration: number,
    public tabId: string,
    public request: Request,
    public queryMode: string
  ) {
  }
}
