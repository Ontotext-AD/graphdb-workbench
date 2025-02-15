import {WizardStep} from "./wizard";

export const SchemaSourceType = {
    GRAPHQL_SCHEMA_SHAPES: 'graphql_schema_shapes',
    SHACL_SHAPES: 'shacl_shapes'
};

export const OntologyShaclShapeSource = {
    USE_ALL_GRAPHS: 'use_all_graphs',
    USE_SHACL_SHAPE_GRAPH: 'use_shacl_shape_graph',
    PICK_GRAPHS: 'pick_graphs'
}

export class SelectSchemaSourceStep extends WizardStep {
    _schemaSourceTypes = [
        {value: SchemaSourceType.GRAPHQL_SCHEMA_SHAPES},
        {value: SchemaSourceType.SHACL_SHAPES}
    ];
    _schemaSourceType = this._schemaSourceTypes[0].value;

    _ontologyShaclShapeSources = [
        {value: OntologyShaclShapeSource.USE_ALL_GRAPHS},
        {value: OntologyShaclShapeSource.USE_SHACL_SHAPE_GRAPH},
        {value: OntologyShaclShapeSource.PICK_GRAPHS}
    ];
    _ontotlogyShaclShapeSource = this._ontologyShaclShapeSources[0].value;

    constructor() {
        super('select_schema_sources', undefined, 'schema-sources',true);
    }

    get ontotlogyShaclShapeSource() {
        return this._ontotlogyShaclShapeSource;
    }

    set ontotlogyShaclShapeSource(value) {
        this._ontotlogyShaclShapeSource = value;
    }

    get ontologyShaclShapeSources() {
        return this._ontologyShaclShapeSources;
    }

    set ontologyShaclShapeSources(value) {
        this._ontologyShaclShapeSources = value;
    }

    get schemaSourceType() {
        return this._schemaSourceType;
    }

    set schemaSourceType(value) {
        this._schemaSourceType = value;
    }

    get schemaSourceTypes() {
        return this._schemaSourceTypes;
    }

    set schemaSourceTypes(value) {
        this._schemaSourceTypes = value;
    }
}

export class ConfigureEndpointStep extends WizardStep {
    constructor() {
        super('configure_endpoint', undefined, 'endpoint-config', false);
    }
}

export class GenerateEndpointStep extends WizardStep {
    constructor() {
        super('generate_endpoint', undefined, 'generate-endpoint', false);
    }
}
