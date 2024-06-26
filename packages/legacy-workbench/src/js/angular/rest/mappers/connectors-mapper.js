import {
    ConnectorListModel,
    ConnectorModel,
    ConnectorTypeModel,
    ConnectorTypesListModel
} from "../../models/connectors/connectors";

/**
 * Maps the connectors response data to a ConnectorTypesListModel. These are all available connector types.
 * @param {{}} data
 * @return {ConnectorTypesListModel}
 */
export const connectorTypesListMapper = (data) => {
    const connectorListModel = new ConnectorTypesListModel();
    if (!data) {
        return connectorListModel;
    }
    connectorListModel.connectors = Object.keys(data).map((key) => {
        return new ConnectorTypeModel({
            name: key,
            prefix: data[key]
        });
    });
    return connectorListModel;
};

/**
 * Maps the connectors response data to a ConnectorListModel. These are the connector instances of one specific type.
 * @param {*[]} data
 * @return {ConnectorListModel}
 */
export const connectorsMapper = (data) => {
    const connectors = new ConnectorListModel();
    if (!data) {
        return connectors;
    }
    connectors.connectors = data.map((connectorResponse) => {
        return new ConnectorModel(connectorResponse);
    });
    return connectors;
};
