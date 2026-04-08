import {Tab} from '../yasgui/yasgui';
import {OntotextYasguiEvent} from './ontotext-yasgui-event';

export class SaveQueryOpened {
  public tab: Tab;

  constructor(eventData: OntotextYasguiEvent) {
    this.tab = eventData.detail.payload.tab!;
  }

  getTab() {
    return this.tab;
  }
}
