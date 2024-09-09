import 'angular/rest/connectors.rest.service';
import {connectorsMapper, connectorTypesListMapper} from "../../rest/mappers/connectors-mapper";
import {SelectMenuOptionsModel} from "../../models/form-fields";

const modules = ['graphdb.framework.rest.connectors.service'];

angular
    .module('graphdb.framework.core.services.connectors', modules)
    .factory('ConnectorsService', ConnectorsService);

ConnectorsService.$inject = ['ConnectorsRestService'];

function ConnectorsService(ConnectorsRestService) {

    /**
     * Fetches all connector types from the server.
     * @return {Promise<ConnectorTypesListModel>}
     */
    const getConnectorTypes = () => {
        return ConnectorsRestService.getConnectors()
            .then((response) => connectorTypesListMapper(response.data));
    };

    /**
     * Fetches the connector prefix by its name.
     * @param {string} name
     * @return {Promise<string|null>}
     */
    const getConnectorPrefixByName = (name) => {
        return getConnectorTypes()
            .then((connectorTypesModel) => {
                const connector = connectorTypesModel.getConnectorByName(name);
                return connector ? connector.prefix : null;
            });
    };

    /**
     * Fetches all connectors of a specific type defined by the prefix.
     * @param {string} prefix
     * @return {Promise<ConnectorListModel>}
     */
    const getConnectorsByType = (prefix) => {
        return ConnectorsRestService.hasConnector(encodeURIComponent(prefix))
            .then((response) => connectorsMapper(response.data));
    };

    /**
     * Fetches all connectors of a specific type defined by the prefix and returns them as SelectMenuOptionsModel.
     * @param {string} prefix
     * @return {Promise<SelectMenuOptionsModel[]>}
     */
    const getConnectorsByTypeAsSelectMenuOptions = (prefix) => {
        return getConnectorsByType(prefix)
            .then((connectorsModel) => connectorsModel.connectors.map((connector) => {
                return new SelectMenuOptionsModel({
                    value: connector.name,
                    label: connector.name
                });
            }));
    };

    return {
        getConnectorTypes,
        getConnectorsByType,
        getConnectorPrefixByName,
        getConnectorsByTypeAsSelectMenuOptions
    };
}
