import {Model} from '../common';
import {ConnectorCommand} from './connector-command';

/**
 * Result of checking whether a SPARQL update creates, repairs or drops a connector.
 */
export class ConnectorCheckResult extends Model<ConnectorCheckResult> {
  /** The connector command in the update, or undefined when the update is not a connector command. */
  readonly command?: ConnectorCommand;
  /** Whether the plugin that serves the connector type is active. */
  readonly hasSupport?: boolean;
  /** The connector type, e.g. `lucene`. */
  readonly connectorType?: string;
  /** The plugin that serves the connector type. */
  readonly pluginName?: string;
  /** The name of the connector instance. */
  readonly name?: string;
  /** The IRI of the connector instance. */
  readonly iri?: string;

  constructor(data: Partial<ConnectorCheckResult>) {
    super();
    this.command = data.command;
    this.hasSupport = data.hasSupport;
    this.connectorType = data.connectorType;
    this.pluginName = data.pluginName;
    this.name = data.name;
    this.iri = data.iri;
  }
}
