import {Model} from '../common';
import {StartMode} from './start-mode';

/**
 * Represents a graph configuration with fields such as name, id, owner, etc.
 */
export class GraphConfig extends Model<GraphConfig> {
  id: string;
  name: string;
  description?: string;
  owner: string;
  repositoryId?: string;
  hint?: string;
  shared: boolean;
  startMode: StartMode;

  /**
   * Graph may start from IRI. There may be no startGraphQuery and startIRI, then user is send to type startIRI.
   */
  startIRI?: string;

  /**
   * Optional label for the start IRI, typically provided when using autocomplete with labels.
   */
  startIRILabel?: string;

  startQueryIncludeInferred: boolean;
  startQuerySameAs: boolean;

  /**
   * Query for initial data. If present should be used with priority over startIRI.
   */
  startGraphQuery?: string;

  /**
   * The query to expand links
   */
  expandQuery?: string;

  /**
   * The query for predicate labels on links
   */
  predicateLabelQuery?: string;

  /**
   * The query for the info side panel to get all datatype properties values
   */
  resourcePropertiesQuery?: string;
  /**
   * The query to obtain resource details
   */
  resourceQuery?: string;

  constructor(data: Omit<GraphConfig, 'copy'>) {
    super();
    this.id = data.id;
    this.name = data.name;
    this.description = data.description;
    this.owner = data.owner;
    this.repositoryId = data.repositoryId;
    this.hint = data.hint;
    this.shared = data.shared;
    this.startMode = data.startMode;
    this.startIRI = data.startIRI;
    this.startIRILabel = data.startIRILabel;
    this.startQueryIncludeInferred = data.startQueryIncludeInferred;
    this.startQuerySameAs = data.startQuerySameAs;
    this.startGraphQuery = data.startGraphQuery;
    this.expandQuery = data.expandQuery;
    this.predicateLabelQuery = data.predicateLabelQuery;
    this.resourcePropertiesQuery = data.resourcePropertiesQuery;
    this.resourceQuery = data.resourceQuery;
  }
}
