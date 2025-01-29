import {cloneDeep} from 'lodash';

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
        getSelectedEndpoint
    };
}

export const GraphqlEventName = {

};
