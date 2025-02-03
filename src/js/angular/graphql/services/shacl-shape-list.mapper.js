import {GraphListOptions, GraphOption} from "../../models/graphs/graph-list-options";

/**
 * Maps the response data to a GraphList.
 * @param {*} data The shacl shape graphs response data.
 * @returns {GraphListOptions} The mapped shacl shape graph list.
 */
export const shaclShapeGraphListOptionsMapper = (data) => {
    if (!data || !data.shacl_graphs) {
        return new GraphListOptions();
    }
    const graphModels = data.shacl_graphs.map((graph) => {
        return new GraphOption({
            uri: graph,
            label: graph,
            id: graph
        });
    });
    return new GraphListOptions(graphModels);
}
