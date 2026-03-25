export interface ConnectorResponse {
  connectorName: string;
  hasSupport: boolean;
  pluginName: string;
  order: number;
  // I don't see these below in the connectors/check response but they are later used in the legacy sparql view controller
  command: string;
  name: string;
  iri: string;
}
