import {StartMode} from '../../../../models/graph-config';

/**
 * Represents a collection containing graph configurations from the server.
 */
export type GraphConfigListResponse = GraphConfigResponse[];

/**
 * Represents a graph configuration response from the server.
 */
export interface GraphConfigResponse {
  id: string;
  description?: string;
  name: string;
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
}
