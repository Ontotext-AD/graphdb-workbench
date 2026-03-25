export class SavedQuery {
  /**
   * The name of the saved query.
   */
  queryName: string;
  /**
   * The SPARQL query string that is saved.
   */
  query: string;
  /**
   * The username of the owner of the saved query.
   */
  owner: string;
  /**
   * Indicates whether the saved query is public (shared) or private.
   */
  isPublic: boolean;
  /**
   * Indicates whether the saved query is read-only for the current user.
   * A query is considered read-only if the current user is not the owner of the query.
   */
  readonly: boolean;

  constructor(data: Partial<SavedQuery>) {
    this.queryName = data.queryName ?? '';
    this.query = data.query ?? '';
    this.owner = data.owner ?? '';
    this.isPublic = data.isPublic ?? false;
    this.readonly = data.readonly ?? false;
  }
}
