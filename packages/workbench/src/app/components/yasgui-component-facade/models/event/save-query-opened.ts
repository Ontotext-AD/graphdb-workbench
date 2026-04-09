import {Tab} from '../yasgui/yasgui';
import {OntotextYasguiEvent} from './ontotext-yasgui-event';
import {EventDataType} from './event-data-type';

export class SaveQueryOpened {
  public type: EventDataType;
  public tab: Tab;

  constructor(eventData: OntotextYasguiEvent) {
    this.type = eventData.type;
    this.tab = eventData.detail.payload.tab!;
  }

  getTab() {
    return this.tab;
  }
}
