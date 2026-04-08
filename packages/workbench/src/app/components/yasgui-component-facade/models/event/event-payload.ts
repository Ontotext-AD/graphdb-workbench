import {QueryResponse} from '../query-response';
/**
 * The payload of an event emitted by the YasguiComponentFacade.
 */
export class EventPayload {
  constructor(
    public duration: number,
    public tabId: string,
    public request: Request,
    public queryMode: string,
    public value?: string,
    public pluginName?: string,
    public query?: string,
    public infer?: boolean,
    public sameAs?: boolean,
    public message?: string,
    public code?: string,
    public messageType?: string,
    public queryType?: string,
    public pageSize?: number,
    public response?: QueryResponse,
  ) {
  }
}
