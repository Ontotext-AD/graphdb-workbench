import {Tab} from '../yasgui/yasgui';
import {EventDataType} from './event-data-type';
import {SaveQueryOpenedEventPayload} from './event-payload';

/**
 * Model for event of type {@link EventDataType.SAVE_QUERY_OPENED} emitted by "ontotext-yasgui-web-component".
 */
export class SaveQueryOpened {
  public type = EventDataType.SAVE_QUERY_OPENED as const;
  public tab: Tab;

  /**
   * Constructs the model for {@link EventDataType.SAVE_QUERY_OPENED} event.
   *
   * @param eventPayload - event payload emitted by "ontotext-yasgui-web-component" when a saved query is opened in a tab.
   */
  constructor(eventPayload: SaveQueryOpenedEventPayload) {
    this.tab = eventPayload.tab;
  }

  getTab() {
    return this.tab;
  }
}
