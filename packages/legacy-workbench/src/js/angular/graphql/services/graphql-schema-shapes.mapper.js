import {GraphqlSchemaShape, GraphqlSchemaShapes} from "../../models/graphql/graphql-schema-shapes";

/**
 * Map the GraphQL schema shapes data to the model.
 * @param {*} data The GraphQL schema shapes data as returned from the server.
 * @return {GraphqlSchemaShapes}
 */
export const graphqlSchemaShapesMapper = (data) => {
    if (!data || !data.shapes) {
        return new GraphqlSchemaShapes([]);
    }
    const shapeModels = data.shapes.map((shape) => shapeModelMapper(shape));
    return new GraphqlSchemaShapes(shapeModels);
}

/**
 * Map the GraphQL schema shape data to the model.
 * @param {*} data The GraphQL schema shape data as returned from the server.
 * @returns {GraphqlSchemaShape|undefined}
 */
export const shapeModelMapper = (data) => {
    if (!data) {
        return;
    }
    return new GraphqlSchemaShape({
        id: data.id,
        name: data.name,
        label: data.label,
        description: data.description
    });
}
