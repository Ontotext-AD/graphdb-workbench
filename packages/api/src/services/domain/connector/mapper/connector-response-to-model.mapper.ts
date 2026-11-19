import {MapperFn} from '../../../../providers';
import {ConnectorResponse} from '../response/connector-response';
import {ConnectorCheckResult, ConnectorCommand} from '../../../../models/connector';
import {toEnum} from '../../../utils/enum-util';

/**
 * Maps the response from the connectors/check endpoint to the ConnectorCheckResult model.
 * @param data The response from the connectors/check endpoint.
 * @returns The mapped ConnectorCheckResult model.
 * @throws Error when the response has an unknown command.
 */
export const mapConnectorResponseToModel: MapperFn<ConnectorResponse, ConnectorCheckResult> = (data) => {
  return new ConnectorCheckResult({
    command: data.command ? toEnum(ConnectorCommand, data.command) : undefined,
    hasSupport: data.hasSupport,
    connectorType: data.connectorName,
    pluginName: data.pluginName,
    name: data.name,
    iri: data.iri,
  });
};
