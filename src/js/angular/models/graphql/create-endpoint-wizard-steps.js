import {WizardStep} from "./wizard";

export class SelectSchemaSourceStep extends WizardStep {
    #schemaSourceTypes = [
        {value: 'graphql_schema_shapes'},
        {value: 'shacl_shapes'}
    ];
    #schemaSourceType = this.#schemaSourceTypes[0].value;

    #ontotlogyShaclShapeSources = [
        {value: 'use_all_graphs'},
        {value: 'use_shacl_shape_graph'},
        {value: 'pick_graphs'}
    ];
    #ontotlogyShaclShapeSource = this.#ontotlogyShaclShapeSources[0].value;

    constructor() {
        super('select_schema_sources', 'js/angular/graphql/templates/select-schema-sources.html', 'schema-sources',true);
    }

    get ontotlogyShaclShapeSource() {
        return this.#ontotlogyShaclShapeSource;
    }

    set ontotlogyShaclShapeSource(value) {
        this.#ontotlogyShaclShapeSource = value;
    }

    get ontotlogyShaclShapeSources() {
        return this.#ontotlogyShaclShapeSources;
    }

    set ontotlogyShaclShapeSources(value) {
        this.#ontotlogyShaclShapeSources = value;
    }

    get schemaSourceType() {
        return this.#schemaSourceType;
    }

    set schemaSourceType(value) {
        this.#schemaSourceType = value;
    }

    get schemaSourceTypes() {
        return this.#schemaSourceTypes;
    }

    set schemaSourceTypes(value) {
        this.#schemaSourceTypes = value;
    }
}

export class ConfigureEndpointStep extends WizardStep {
    constructor() {
        super('configure_endpoint', 'js/angular/graphql/templates/endpoint-config.html', 'endpoint-config', false);
    }
}
