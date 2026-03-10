import {Yasqe} from '../yasqe/yasqe';

export interface YasguiTab {
  getYasqe(): Yasqe;
}

export interface Yasgui {
  getTab(): YasguiTab | undefined;
}
