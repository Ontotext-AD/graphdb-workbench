/**
 * Data payload passed to {@link ConnectorProgressComponent}.
 */
export class ConnectorProgressData {
  actionName: string;
  iri: string;
  connectorName: string;

  constructor(actionName: string, iri: string, connectorName: string) {
    this.actionName = actionName;
    this.iri = iri;
    this.connectorName = connectorName;
  }
}