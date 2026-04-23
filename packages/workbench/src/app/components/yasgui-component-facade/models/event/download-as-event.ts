import {EventDataType} from './event-data-type';
import {OntotextYasguiEvent} from './ontotext-yasgui-event';

/**
 * Model for event of type {@link EventDataType.DOWNLOAD_AS} emitted by "ontotext-yasgui-web-component".
 */
export class DownloadAsEvent {
  public readonly type = EventDataType.DOWNLOAD_AS as const;
  public contentType: string | undefined;
  public pluginName: string | undefined;
  public query: string | undefined;
  public infer: boolean | undefined;
  public sameAs: boolean | undefined;

  /**
   * Constructs the model for {@link EventDataType.DOWNLOAD_AS} event.
   *
   * @param eventData - event emitted by "ontotext-yasgui-web-component".
   */
  constructor(eventData: OntotextYasguiEvent) {
    this.contentType = eventData.detail.payload.value;
    this.pluginName = eventData.detail.payload.pluginName;
    this.query = eventData.detail.payload.query;
    this.infer = eventData.detail.payload.infer;
    this.sameAs = eventData.detail.payload.sameAs;
  }
}
