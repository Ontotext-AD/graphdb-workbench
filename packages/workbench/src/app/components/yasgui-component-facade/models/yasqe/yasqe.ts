import {QueryMode} from '../query-mode';
import {QueryType} from './query-type';

export interface Yasqe {
  getQueryType(): QueryType;
  getQueryMode(): QueryMode;
  getValue(): string;
  getSameAs(): boolean;
  getInfer(): boolean;
}
