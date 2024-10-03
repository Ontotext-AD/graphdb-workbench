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
     * Fetches all connector types from the server for the repository with id <code>repositoryId</code> and location <code>repositoryLocation</code>.
     * If the repository ID and repository location are not provided, the values persisted in local storage will be used {@see authentication.interceptor.js}.
     *
     * @param {string} repositoryId - (optional) The repository id.
     * @param {string} repositoryLocation - (optional) The repository location.
     * @return {Promise<ConnectorTypesListModel>}
     */
    const getConnectorTypes = (repositoryId, repositoryLocation) => {
        return ConnectorsRestService.getConnectors(repositoryId, repositoryLocation)
            .then((response) => connectorTypesListMapper(response.data));
    };

    /**
     * Fetches the connector prefix by its name for the repository with id <code>repositoryId</code> and location <code>repositoryLocation</code>.
     * If the repository ID and repository location are not provided, the values persisted in local storage will be used {@see authentication.interceptor.js}.
     *
     * @param {string} name
     * @param {string} repositoryId - (optional) The repository id.
     * @param {string} repositoryLocation - (optional) The repository location.
     * @return {Promise<string|null>}
     */
    const getConnectorPrefixByName = (name, repositoryId, repositoryLocation) => {
        return getConnectorTypes(repositoryId, repositoryLocation)
            .then((connectorTypesModel) => {
                const connector = connectorTypesModel.getConnectorByName(name);
                return connector ? connector.prefix : null;
            });
    };

    /**
     * Fetches all connectors of a specific type defined by the prefix for the repository with id <code>repositoryId</code>
     * and location <code>repositoryLocation</code>. If the repository ID and repository location are not provided,
     * the values persisted in local storage will be used {@see authentication.interceptor.js}.
     * @param {string} prefix
     * @param {string} repositoryId - (optional) The repository id.
     * @param {string} repositoryLocation - (optional) The repository location.
     * @return {Promise<ConnectorListModel>}
     */
    const getConnectorsByType = (prefix, repositoryId, repositoryLocation) => {
        return ConnectorsRestService.hasConnector(encodeURIComponent(prefix), repositoryId, repositoryLocation)
            .then((response) => {
                return connectorsMapper(response.data);
            });
    };

    /**
     * Fetches all connectors of a specific type defined by the prefix and returns them as SelectMenuOptionsModel
     * for the repository with id <code>repositoryId</code> and location <code>repositoryLocation</code>. If the repository ID
     * and repository location are not provided, the values persisted in local storage will be used {@see authentication.interceptor.js}.
     * @param {string} prefix
     * @param {string} repositoryId - (optional) The repository id.
     * @param {string} repositoryLocation - (optional) The repository location.
     * @return {Promise<SelectMenuOptionsModel[]>}
     */
    const getConnectorsByTypeAsSelectMenuOptions = (prefix, repositoryId, repositoryLocation) => {
        return getConnectorsByType(prefix, repositoryId, repositoryLocation)
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
