import {Model} from '../common/model';

/**
 * A pre-resolved graph link derived from a graph-explore query result.
 */
export class GraphExploreLink extends Model<GraphExploreLink> {
  /** Source element IRI. */
  source: string;
  /** Target element IRI. */
  target: string;
  /** Display/short predicate values of the relationship(s) between source and target. */
  predicates: string[];
  /** Full (absolute) predicate IRIs of the relationship(s) between source and target. */
  rawPredicates: string[];

  constructor(data: Omit<GraphExploreLink, 'copy'>) {
    super();
    this.source = data.source;
    this.target = data.target;
    this.predicates = data.predicates;
    this.rawPredicates = data.rawPredicates;
  }
}
