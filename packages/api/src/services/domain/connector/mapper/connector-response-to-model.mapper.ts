import {MapperFn} from '../../../../providers';
import {ConnectorResponse} from '../response/connector-response';
import {BeforeUpdateQueryResult, BeforeUpdateQueryResultStatus, ConnectorCommand} from '../../../../models/connector';
import {UnknownConnectorCommandError} from '../error/unknown-connector-command-error';

/**
 * Maps the response from the connectors/check endpoint to the BeforeUpdateQueryResult model.
 * @param data The response from the connectors/check endpoint.
 * @returns The mapped BeforeUpdateQueryResult model.
 */
export const mapConnectorResponseToModel: MapperFn<ConnectorResponse, BeforeUpdateQueryResult> = (data) => {
  let result: BeforeUpdateQueryResult;
  if (!data.command) {
    result = toNoCommandResponse(data);
  } else if (!data.hasSupport) {
    result = toHasNotSupport(data);
  } else if (ConnectorCommand.CREATE === data.command) {
    result = toCreateCommandResponse(data);
  } else if (ConnectorCommand.REPAIR === data.command) {
    result = toRepairCommandResponse(data);
  } else if (ConnectorCommand.DROP === data.command) {
    result = toDropCommandResponse(data);
  } else {
    throw new UnknownConnectorCommandError(data.command);
  }
  result.iri = data.iri;
  return result;
};

const toNoCommandResponse = (data: ConnectorResponse) => {
  return new BeforeUpdateQueryResult(BeforeUpdateQueryResultStatus.SUCCESS, data.command);
};

const toHasNotSupport = (data: ConnectorResponse) => {
  const parameters = [
    {connectorName: data.connectorName},
    {pluginName: data.pluginName},
  ];
  return new BeforeUpdateQueryResult(BeforeUpdateQueryResultStatus.ERROR, data.command,'query.editor.inactive.plugin.warning.msg', parameters);
};

const toCreateCommandResponse = (data: ConnectorResponse) => {
  const parameters = [{name: data.name}];
  return new BeforeUpdateQueryResult(BeforeUpdateQueryResultStatus.SUCCESS, data.command, 'created.connector', parameters);
};

const toRepairCommandResponse = (data: ConnectorResponse) => {
  const parameters = [{name: data.name}];
  return new BeforeUpdateQueryResult(BeforeUpdateQueryResultStatus.SUCCESS, data.command, 'query.editor.repaired.connector', parameters);
};

const toDropCommandResponse = (data: ConnectorResponse) => {
  const parameters = [{name: data.name}];
  return new BeforeUpdateQueryResult(BeforeUpdateQueryResultStatus.SUCCESS, data.command, 'externalsync.delete.success.msg', parameters);
};
