import {cloneDeep} from 'lodash';
import {GraphqlEndpointConfiguration} from "../../models/graphql/graphql-endpoint-configuration";

angular
    .module('graphdb.framework.graphql.services.graphql-context', [])
    .factory('GraphqlContextService', GraphqlContextService);

GraphqlContextService.$inject = ['EventEmitterService', 'GraphqlService'];

function GraphqlContextService(EventEmitterService) {

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
    let _newEndpoint = undefined;

    /**
     * Resets the context by clearing all the stored values.
     */
    const resetContext = () => {
        _selectedEndpoint = undefined;
    };

    /**
     * Sets the selected GraphQL endpoint.
     * @param {GraphqlEndpointInfo} endpoint The selected endpoint.
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

    const createEndpointInstance = () => {
        _newEndpoint = new GraphqlEndpointConfiguration();
        return _newEndpoint;
    };

    const getNewEndpoint = () => {
        return cloneDeep(_newEndpoint);
    }

    const startCreateEndpointWizard = () => {
        emit(GraphqlEventName.START_CREATE_ENDPOINT_WIZARD, createEndpointInstance());
    };

    const cancelEndpointCreation = () => {
        emit(GraphqlEventName.CANCEL_ENDPOINT_CREATION, getNewEndpoint());
    }

    const nextEndpointCreationStep = () => {
        emit(GraphqlEventName.NEXT_ENDPOINT_CREATION_STEP, getNewEndpoint());
    }

    const previousEndpointCreationStep = () => {
        emit(GraphqlEventName.PREVIOUS_ENDPOINT_CREATION_STEP, getNewEndpoint());
    }

    const generateEndpoint = () => {
        emit(GraphqlEventName.GENERATE_ENDPOINT, getNewEndpoint());
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
        setSelectedEndpoint,
        getSelectedEndpoint,
        startCreateEndpointWizard,
        generateEndpoint,
        cancelEndpointCreation,
        nextEndpointCreationStep,
        previousEndpointCreationStep,
        subscribe
    };
}

export const GraphqlEventName = {
    /**
     * The event emitted when the user wants to start the create endpoint wizard.
     */
    START_CREATE_ENDPOINT_WIZARD: 'startCreateEndpointWizard',
    /**
     * The event emitted when a new GraphQL endpoint should be generated.
     */
    GENERATE_ENDPOINT: 'generateEndpoint',
    /**
     * The event emitted when the user wants to cancel the endpoint creation.
     */
    CANCEL_ENDPOINT_CREATION: 'cancelEndpointCreation',
    /**
     * The event emitted when the user wants to move to the next step in the create endpoint wizard.
     */
    NEXT_ENDPOINT_CREATION_STEP: 'nextEndpointCreationStep',
    /**
     * The event emitted when the user wants to move to the previous step in the create endpoint wizard.
     */
    PREVIOUS_ENDPOINT_CREATION_STEP: 'previousEndpointCreationStep'
};
