import {Model} from '../common/model';

/**
 * A pre-resolved graph edge derived from a graph-explore query result.
 *
 * Mirrors the neutral shape Reactodia's `config.seedGraph` expects: a source/target pair with the
 * full predicate IRIs of the relationship(s) between them. Used to visualize the result of a
 * CONSTRUCT query, whose relationships are computed and therefore not persisted in the repository,
 * so they cannot be fetched lazily through the SPARQL provider and must be supplied directly.
 */
export class GraphExploreLink extends Model<GraphExploreLink> {
  /** Source element IRI. */
  source: string;
  /** Target element IRI. */
  target: string;
  /** Full predicate IRIs of the relationship(s) between source and target. */
  predicates: string[];
  /** Raw, unresolved predicate values of the relationship(s) between source and target. */
  rawPredicates: string[];

  constructor(data: Omit<GraphExploreLink, 'copy'>) {
    super();
    this.source = data.source;
    this.target = data.target;
    this.predicates = data.predicates;
    this.rawPredicates = data.rawPredicates;
  }
}
