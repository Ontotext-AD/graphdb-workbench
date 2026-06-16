import {EventDataType} from './event-data-type';
import {DownloadAsEventPayload} from './event-payload';

/**
 * Model for event of type {@link EventDataType.DOWNLOAD_AS} emitted by "ontotext-yasgui-web-component".
 */
export class DownloadAsEvent {
  public readonly type = EventDataType.DOWNLOAD_AS as const;
  public contentType: string;
  public pluginName: string;
  public query: string;
  public infer: boolean;
  public sameAs: boolean;

  /**
   * Constructs the model for {@link EventDataType.DOWNLOAD_AS} event.
   *
   * @param eventPayload - event payload emitted by "ontotext-yasgui-web-component" when the DownloadAs button is clicked.
   */
  constructor(eventPayload: DownloadAsEventPayload) {
    this.contentType = eventPayload.value;
    this.pluginName = eventPayload.pluginName;
    this.query = eventPayload.query;
    this.infer = eventPayload.infer;
    this.sameAs = eventPayload.sameAs;
  }
}
