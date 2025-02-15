import {GraphqlSchemaShapes} from "./graphql-schema-shapes";
import {GraphListOptions} from "../graphs/graph-list-options";
import {GraphqlEndpointConfigurationSettings} from "./graphql-endpoint-configuration-setting";
import {GraphqlEndpointOverview} from "./graphql-endpoint-overview-list";
import {CreateEndpointFromShapesRequest} from "./create-endpoint-from-shapes-request";
import {CreateEndpointFromOwlRequest} from "./create-endpoint-from-owl-request";
import {OntologyShaclShapeSource, SchemaSourceType} from "./create-endpoint-wizard-steps";

export class GraphqlEndpointConfiguration {
    /**
     * One of SchemaSourceType.GRAPHQL_SCHEMA_SHAPES or SchemaSourceType.SHACL_SHAPES
     * @type {string}
     * @private
     */
    _schemaSourceType;
    /**
     * One of OntologyShaclShapeSource.USE_ALL_GRAPHS or OntologyShaclShapeSource.USE_SHACL_SHAPE_GRAPH or
     * OntologyShaclShapeSource.PICK_GRAPHS
     * @type {string}
     * @private
     */
    _owlOrShaclSourceType;
    /**
     * @type {GraphqlSchemaShapes}
     */
    _selectedGraphqlSchemaShapes;
    /**
     * @type {GraphListOptions}
     * @private
     */
    _selectedGraphs;
    /**
     * @type {GraphqlEndpointParams}
     * @private
     */
    _params;
    /**
     * The endpoint configuration settings model.
     * @type {GraphqlEndpointConfigurationSettings|undefined}
     * @private
     */
    _settings ;

    constructor() {
        this._schemaSourceType = SchemaSourceType.GRAPHQL_SCHEMA_SHAPES;
        this._owlOrShaclSourceType = OntologyShaclShapeSource.USE_ALL_GRAPHS;
        this._selectedGraphqlSchemaShapes = new GraphqlSchemaShapes();
        this._selectedGraphs = new GraphListOptions();
        this._params = new GraphqlEndpointParams({});
        this._endpointConfigurationSettings = new GraphqlEndpointConfigurationSettings();
    }

    /**
     * Builds an endpoint create request from the current configuration.
     * @param {string} sourceRepositoryId The source repository ID.
     * @returns {CreateEndpointFromShapesRequest}
     */
    toCreateEndpointFromShapesRequest(sourceRepositoryId) {
        return new CreateEndpointFromShapesRequest({
            fromRepo: sourceRepositoryId,
            shapes: this.selectedGraphqlSchemaShapes.getShapeIds(),
            config: this.settings.toFlatJSON()
        })
    }

    /**
     * Builds an endpoint create request from the current configuration.
     * @param {string} sourceRepositoryId The source repository ID.
     * @returns {CreateEndpointFromOwlRequest}
     */
    toCreateEndpointFromOwlRequest(sourceRepositoryId) {
        return new CreateEndpointFromOwlRequest({
            fromRepo: sourceRepositoryId,
            namedGraphs: this.selectedGraphs.graphList,
            id: this.params.endpointId,
            label: this.params.endpointLabel,
            description: this.params.endpointDescription,
            vocab_prefix: this.params.vocPrefix,
            config: this.settings.toFlatJSON()
        });
    }

    /**
     * Returns an array of GraphQL endpoint overview models for the selected shapes.
     * @returns {GraphqlEndpointOverview[]}
     */
    getSelectedGraphqlSchemaShapesOverview() {
        if (this.schemaSourceType === SchemaSourceType.GRAPHQL_SCHEMA_SHAPES) {
            return this.selectedGraphqlSchemaShapes.shapes.map((shape) => {
                return new GraphqlEndpointOverview({
                    label: shape.label && shape.id ? `${shape.label} | ${shape.id}` : shape.label || shape.id
                })
            });
        }
        if (this.schemaSourceType === SchemaSourceType.SHACL_SHAPES) {
            return this.selectedGraphs.graphList.map((graph) => {
                return new GraphqlEndpointOverview({
                    label: graph.label && graph.uri ? `${graph.label} | ${graph.uri}` : graph.label || graph.uri
                })
            });
        }
    }

    /**
     * Returns the count of selected GraphQL schema shapes.
     * @returns {number} The count of selected GraphQL schema shapes.
     */
    getSelectedGraphqlSchemaShapesCount() {
        return this.selectedGraphqlSchemaShapes.shapes.length;
    }

    /**
     * Returns if there are selected GraphQL schema shapes.
     * @returns {boolean} True if there are selected GraphQL schema shapes, false otherwise.
     */
    hasSelectedGraphqlSchemaShapes() {
        return this.getSelectedGraphqlSchemaShapesCount() > 0;
    }

    /**
     * Returns the count of selected graphs.
     * @returns {number} The count of selected graphs.
     */
    getSelectedGraphsCount() {
        return this.selectedGraphs.graphList.length;
    }

    /**
     * Returns if there are selected graphs.
     * @returns {boolean} True if there are selected graphs, false otherwise.
     */
    hasSelectedGraphs() {
        return this.getSelectedGraphsCount() > 0;
    }

    get owlOrShaclSourceType() {
        return this._owlOrShaclSourceType;
    }

    set owlOrShaclSourceType(value) {
        this._owlOrShaclSourceType = value;
    }

    get schemaSourceType() {
        return this._schemaSourceType;
    }

    set schemaSourceType(value) {
        this._schemaSourceType = value;
    }

    get settings() {
        return this._settings;
    }

    set settings(value) {
        this._settings = value;
    }

    get selectedGraphs() {
        return this._selectedGraphs;
    }

    set selectedGraphs(value) {
        this._selectedGraphs = value;
    }

    get params() {
        return this._params;
    }

    set params(value) {
        this._params = value;
    }

    get selectedGraphqlSchemaShapes() {
        return this._selectedGraphqlSchemaShapes;
    }

    set selectedGraphqlSchemaShapes(value) {
        this._selectedGraphqlSchemaShapes = value;
    }
}

export class GraphqlEndpointParams {
    /**
     * @type {string}
     * @private
     */
    _endpointId;
    /**
     * @type {string}
     * @private
     */
    _endpointLabel;
    /**
     * @type {string}
     * @private
     */
    _endpointDescription;
    /**
     * @type {string}
     * @private
     */
    _vocPrefix;

    constructor(data) {
        this._endpointId = data.endpointId || '';
        this._endpointLabel = data.endpointLabel || '';
        this._vocPrefix = data.vocPrefix || '';
        this._endpointDescription = data.endpointDescription || '';
    }

    get endpointId() {
        return this._endpointId;
    }

    set endpointId(value) {
        this._endpointId = value;
    }

    get endpointLabel() {
        return this._endpointLabel;
    }

    set endpointLabel(value) {
        this._endpointLabel = value;
    }

    get endpointDescription() {
        return this._endpointDescription;
    }

    set endpointDescription(value) {
        this._endpointDescription = value;
    }

    get vocPrefix() {
        return this._vocPrefix;
    }

    set vocPrefix(value) {
        this._vocPrefix = value;
    }

    toJSON() {
        return {
            endpointId: this.endpointId,
            endpointLabel: this.endpointLabel,
            vocPrefix: this.vocPrefix,
            description: this.endpointDescription
        };
    }
}
