import {RepositoryState} from './repository-state';
import {RepositoryType} from './repository-type';
import {Model} from '../common';
import {RepositoryReference} from './repository-reference';

const ONTOP_SESAME_TYPE = 'graphdb:OntopRepository';
const FEDX_SESAME_TYPE = 'graphdb:FedXRepository';

/**
 * Holds repository information, such as name, type, state, and other related fields.
 */
export class Repository extends Model<Repository> implements RepositoryReference {
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
  isNew?: boolean;

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
    this.isNew = data?.isNew;
  }

  /**
   * Converts the repository to a repository reference.
   * @returns {RepositoryReference} The repository reference.
   */
  toRepositoryReference(): RepositoryReference {
    return {
      id: this.id,
      location: this.location
    };
  }

  /**
   * Checks if the repository is of type Ontop.
   * @returns {boolean} True if the repository is of type Ontop, false otherwise.
   */
  isOntop(): boolean {
    return this.sesameType === ONTOP_SESAME_TYPE;
  }

  /**
   * Checks if the repository is of type FedX.
   * @returns {boolean} True if the repository is of type FedX, false otherwise.
   */
  isFedx(): boolean {
    return this.sesameType === FEDX_SESAME_TYPE;
  }
}
