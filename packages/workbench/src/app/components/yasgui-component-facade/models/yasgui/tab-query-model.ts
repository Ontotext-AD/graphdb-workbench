/**
 * Represents a query model for a YASGUI tab.
 */
export class TabQueryModel {
  /**
   * The name of the query tab.
   */
  queryName?: string;

  /**
   * The SPARQL query string.
   */
  query?: string;

  /**
   * The username of the owner of this query.
   */
  owner?: string;

  /**
   * Indicates whether the query is publicly shared.
   */
  isPublic: boolean;

  /**
   * Indicates whether the query is read-only for the current user.
   */
  readonly: boolean;

  constructor(
    queryName?: string,
    query?: string,
    owner?: string,
    isPublic = true,
    readonly = true
  ) {
    this.queryName = queryName;
    this.query = query;
    this.owner = owner;
    this.isPublic = isPublic;
    this.readonly = readonly;
  }
}
