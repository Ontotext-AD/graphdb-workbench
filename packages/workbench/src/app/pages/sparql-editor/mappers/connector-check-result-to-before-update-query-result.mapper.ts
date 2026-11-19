import {ConnectorCheckResult, ConnectorCommand, MapperFn} from '@ontotext/workbench-api';
import {
  BeforeUpdateQueryResult,
  BeforeUpdateQueryStatus
} from '../../../components/yasgui-component-facade/models/yasgui/before-update-query-result';

const COMMAND_MESSAGE_LABEL_KEYS: Record<ConnectorCommand, string> = {
  [ConnectorCommand.CREATE]: 'sparql_editor.connector.created',
  [ConnectorCommand.REPAIR]: 'sparql_editor.connector.repaired',
  [ConnectorCommand.DROP]: 'sparql_editor.connector.deleted',
};

/**
 * Maps the connector check of an update query to the result Yasgui needs before it runs the update: an update that
 * is not a connector command runs without a message; a connector command whose plugin is not active is stopped with
 * a message; any other connector command runs with a message naming the connector.
 * @param data The connector check of the update query.
 * @returns The result for Yasgui.
 */
export const mapConnectorCheckResultToBeforeUpdateQueryResult: MapperFn<ConnectorCheckResult, BeforeUpdateQueryResult> = (data) => {
  if (!data.command) {
    return {status: BeforeUpdateQueryStatus.SUCCESS};
  }
  if (!data.hasSupport) {
    return {
      status: BeforeUpdateQueryStatus.ERROR,
      messageLabelKey: 'sparql_editor.connector.plugin_inactive',
      parameters: [
        {key: 'connectorType', value: data.connectorType ?? ''},
        {key: 'pluginName', value: data.pluginName ?? ''},
      ],
    };
  }
  return {
    status: BeforeUpdateQueryStatus.SUCCESS,
    messageLabelKey: COMMAND_MESSAGE_LABEL_KEYS[data.command],
    parameters: [{key: 'name', value: data.name ?? ''}],
  };
};
