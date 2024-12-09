import {RepositoryState} from './repository-state';
import {RepositoryType} from './repository-type';
import {Model} from '../common/model';

/**
 * Holds repository information, such as name, type, state, and other related fields.
 */
export class Repository extends Model<Repository> {
  id: string;
  title: string;
  type: RepositoryType | undefined;
  sesameType: string | undefined;
  uri: string;
  externalUrl: string;
  location: string;
  state: RepositoryState | undefined;
  local: boolean | undefined;
  readable: boolean | undefined;
  writable: boolean | undefined;
  unsupported: boolean | undefined;

  constructor(data?: Partial<Repository>) {
    super();
    this.id = data?.id || '';
    this.title = data?.title || '';
    this.type = data?.type;
    this.sesameType = data?.sesameType;
    this.uri = data?.uri || '';
    this.externalUrl = data?.externalUrl || '';
    this.location = data?.location || '';
    this.state = data?.state;
    this.local = data?.local;
    this.readable = data?.readable;
    this.writable = data?.writable;
    this.unsupported = data?.unsupported;
  }
}
