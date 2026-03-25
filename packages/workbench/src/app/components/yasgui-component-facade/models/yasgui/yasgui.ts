import {Yasqe} from '../yasqe/yasqe';
import {Yasr} from '../yasr/yasr';

export interface YasguiTab {
  getYasqe(): Yasqe;
}

export interface Tab {
  yasgui?: Yasgui;
  getId(): string;
  getYasqe(): Yasqe;
  getYasr(): Yasr;
  getName(): string;
  getQuery(): string;
  setQuery(query: string): void;
}

export interface TabElement extends HTMLElement {
  tabEl: HTMLElement;
}

export interface Yasgui {
  tabElements: Map<string, TabElement>;
  getTab(): YasguiTab | undefined;
}

