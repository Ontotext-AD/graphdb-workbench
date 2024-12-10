import {Model} from '../common/model';

/**
 * Holds repository triples information.
 */
export class RepositorySizeInfo extends Model<RepositorySizeInfo> {

  /**
   * Number of inferred triples.
   */
  inferred: number;

  /**
   * Number of all triples.
   */
  total: number;

  /**
   * Number of explicit triples.
   */
  explicit: number;

  constructor(data?: Partial<RepositorySizeInfo>) {
    super();
    this.inferred = data?.inferred || 0;
    this.total = data?.total || 0;
    this.explicit = data?.explicit || 0;
  }
}
