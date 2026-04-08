import {EventDataType} from './event-data-type';
import {OntotextYasguiEvent} from './ontotext-yasgui-event';

/**
 * Model for event of type {@link EventDataType.DOWNLOAD_AS} emitted by "ontotext-yasgui-web-component".
 */
export class DownloadAsEvent {
  public type: EventDataType;
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
    this.type = eventData.type;
    this.contentType = eventData.payload.value;
    this.pluginName = eventData.payload.pluginName;
    this.query = eventData.payload.query;
    this.infer = eventData.payload.infer;
    this.sameAs = eventData.payload.sameAs;
  }
}
