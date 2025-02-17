import {cloneDeep} from 'lodash';
import {GraphqlEndpointConfiguration} from "../../models/graphql/graphql-endpoint-configuration";
import {EndpointGenerationReportList} from "../../models/graphql/endpoint-generation-report";

angular
    .module('graphdb.framework.graphql.services.graphql-context', [])
    .factory('GraphqlContextService', GraphqlContextService);

GraphqlContextService.$inject = ['EventEmitterService', 'GraphqlService'];

function GraphqlContextService(EventEmitterService) {
    /**
     * The source repository from which the sources for the GraphQL schema generation are retrieved.
     * @type {string|undefined}`
     */
    let _sourceRepository = undefined;

    /**
     * The selected GraphQL endpoint info. The endpoint is selected when the user clicks on an endpoint in the endpoint
     * management view.
     * @type {GraphqlEndpointInfo|undefined}
     * @private
     */
    let _selectedEndpoint = undefined;

    /**
     * The new GraphQL endpoint is present when a new endpoint is being created.
     * @type {GraphqlEndpointConfiguration|undefined}
     * @private
     */
    let _newEndpointConfiguration = undefined;

    /**
     * Returns the value of the source repository.
     * @returns {string|undefined}
     */
    const getSourceRepository = () => {
        return _sourceRepository;
    };

    /**
     * Updates the source repository and emits an event with the new repository id.
     * @param {string} repositoryId The new source repository id.
     */
    const updateSourceRepository = (repositoryId) => {
        _sourceRepository = repositoryId;
        emit(GraphqlEventName.SOURCE_REPOSITORY_UPDATED, getSourceRepository());
    };

    /**
     * Returns the value of the new GraphQL endpoint.
     * @returns {GraphqlEndpointConfiguration|undefined}
     */
    const getNewEndpoint = () => {
        return _newEndpointConfiguration;
    };

    /**
     * Resets the context by clearing all the stored values.
     */
    const resetContext = () => {
        _selectedEndpoint = undefined;
        _newEndpointConfiguration = undefined;
    };

    /**
     * Sets the selected GraphQL endpoint.
     * @param {GraphqlEndpointInfo|EndpointGenerationReport} endpoint The selected endpoint.
     */
    const setSelectedEndpoint = (endpoint) => {
        _selectedEndpoint = endpoint;
    };

    /**
     * Returns a clone value of the selected GraphQL endpoint.
     * @return {GraphqlEndpointInfo|undefined}
     */
    const getSelectedEndpoint = () => {
        return cloneDeep(_selectedEndpoint);
    };

    /**
     * Initializes the new endpoint configuration and emits an event with the new endpoint configuration.
     */
    const createEndpointConfig = () => {
        _newEndpointConfiguration = new GraphqlEndpointConfiguration();
        EventEmitterService.emitSync(GraphqlEventName.ENDPOINT_CONFIG_CREATED, _newEndpointConfiguration);
    }

    const onEndpointConfigCreated = (callback) => {
        if (_newEndpointConfiguration && angular.isFunction(callback)) {
            callback(_newEndpointConfiguration);
        }
        return subscribe(GraphqlEventName.ENDPOINT_CONFIG_CREATED, (endpoint) => callback(endpoint));
    };

    const startCreateEndpointWizard = () => {
        emit(GraphqlEventName.START_CREATE_ENDPOINT_WIZARD, null);
    };

    const cancelEndpointCreation = () => {
        emit(GraphqlEventName.CANCEL_ENDPOINT_CREATION, {});
    }

    const nextEndpointCreationStep = () => {
        emit(GraphqlEventName.NEXT_ENDPOINT_CREATION_STEP, {});
    }

    const previousEndpointCreationStep = () => {
        emit(GraphqlEventName.PREVIOUS_ENDPOINT_CREATION_STEP, {});
    }

    const generateEndpoint = () => {
        emit(GraphqlEventName.GENERATE_ENDPOINT, getNewEndpoint());
    }

    /**
     * Emits an event when the endpoint generation is completed.
     * @param {EndpointGenerationReportList} endpointGenerationReportList The list of endpoint generation reports.
     */
    const endpointGenerated = (endpointGenerationReportList) => {
        emit(GraphqlEventName.ENDPOINT_GENERATED, endpointGenerationReportList);
    }

    /**
     * Emits an event to explore the generated endpoint in the GraphQL Playground.
     * @param endpoint
     */
    const exploreEndpointInPlayground = (endpoint) => {
        emit(GraphqlEventName.EXPLORE_ENDPOINT_IN_PLAYGROUND, endpoint);
    }

    /**
     * Emits an event to open the endpoint generation report.
     * @param {EndpointGenerationReport} endpointReport The endpoint generation report.
     */
    const openEndpointGenerationReport = (endpointReport) => {
        emit(GraphqlEventName.OPEN_ENDPOINT_GENERATION_REPORT, endpointReport);
    }

    /**
     * Emits an event with a deep-cloned payload using the EventEmitterService.
     *
     * @param {string} event - The name of the event to emit. It must be a value from {@link GraphqlEventName}.
     * @param {*} payload - The data to emit with the event. The payload is deep-cloned before emission.
     */
    const emit = (event, payload) => {
        EventEmitterService.emitSync(event, cloneDeep(payload));
    };

    /**
     * Subscribes to an event with the specified callback using the EventEmitterService.
     *
     * @param {string} event - The name of the event to subscribe to. It must be a value from {@link GraphqlEventName}.
     * @param {function} callback - The function to call when the event is emitted.
     * @return {function} - Returns a function that can be called to unsubscribe from the event.
     */
    const subscribe = (event, callback) => {
        return EventEmitterService.subscribeSync(event, (payload) => callback(payload));
    };

    return {
        resetContext,
        updateSourceRepository,
        getSourceRepository,
        setSelectedEndpoint,
        getSelectedEndpoint,
        getNewEndpoint,
        createEndpointConfig,
        onEndpointConfigCreated,
        startCreateEndpointWizard,
        generateEndpoint,
        endpointGenerated,
        exploreEndpointInPlayground,
        openEndpointGenerationReport,
        cancelEndpointCreation,
        nextEndpointCreationStep,
        previousEndpointCreationStep,
        subscribe
    };
}

export const GraphqlEventName = {
    /**
     * The event emitted when the source repository is updated.
     */
    SOURCE_REPOSITORY_UPDATED: 'sourceRepositoryUpdated',
    /**
     * The event emitted when the user wants to start the create endpoint wizard.
     */
    START_CREATE_ENDPOINT_WIZARD: 'startCreateEndpointWizard',
    /**
     * The event emitted when an endpoint configuration is created.
     */
    ENDPOINT_CONFIG_CREATED: 'updateConfigCreated',
    /**
     * The event emitted when a new GraphQL endpoint should be generated.
     */
    GENERATE_ENDPOINT: 'generateEndpoint',
    /**
     * The event emitted when the GraphQL endpoint generation completes.
     */
    ENDPOINT_GENERATED: 'endpointGenerated',
    /**
     * The event emitted when the user wants to cancel the endpoint creation.
     */
    CANCEL_ENDPOINT_CREATION: 'cancelEndpointCreation',
    /**
     * The event emitted when the user wants to explore the generated endpoint in the GraphQL Playground.
     */
    EXPLORE_ENDPOINT_IN_PLAYGROUND: 'exploreEndpointInPlayground',
    /**
     * The event emitted when the user wants to open the endpoint generation report.
     */
    OPEN_ENDPOINT_GENERATION_REPORT: 'openEndpointGenerationReport',
    /**
     * The event emitted when the user wants to move to the next step in the create endpoint wizard.
     */
    NEXT_ENDPOINT_CREATION_STEP: 'nextEndpointCreationStep',
    /**
     * The event emitted when the user wants to move to the previous step in the create endpoint wizard.
     */
    PREVIOUS_ENDPOINT_CREATION_STEP: 'previousEndpointCreationStep'
};
