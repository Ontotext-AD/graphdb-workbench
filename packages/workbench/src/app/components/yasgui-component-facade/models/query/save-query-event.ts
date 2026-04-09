/**
 * Event emitted by the ontotext-yasgui component when a query should be saved.
 * The event payload contains the query data from which a saved query object should be created.
 */
export interface SaveQueryEvent extends CustomEvent {
  detail: {
    queryName: string;
    query: string;
    isPublic: boolean;
    isNew?: boolean;
    messages?: string[]
    originalQueryName?: string;
    owner?: string;
    readonly?: boolean;
  }
}
