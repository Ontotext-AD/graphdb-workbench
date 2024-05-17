import {EventEmitterService} from "./core/services/event-emitter.service";

const modules = [];

angular
    .module('graphdb.framework.global-emitter-buss', modules)
    .factory('GlobalEmitterBuss', GlobalEmitterBuss);

/**
 * A service responsible for emitting events between components. It takes care to registering subscribers and calling them when an event for which they are registered occurs.
 */
function GlobalEmitterBuss() {
    const globalEmitterBuss = new EventEmitterService();

    /**
     * Registers the <code>subscriber</code> for event with name <code>eventName</code>. When event occurred the subscribers will be called.
     * @param {string} eventName - the name of the event that will trigger a subscriber call.
     * @param {Promise<any>} subscriber - promise that will call when event with <code>eventName</code> occurred.
     * @return {(function(): void)|*} - unsubscribe function.
     */
    const subscribe = (eventName, subscriber) => {
        return globalEmitterBuss.subscribe(eventName, subscriber);
    };

    /**
     * Call all subscribers that are registered for event with <code>eventName</code>.
     * @param {string} eventName - name of event.
     * @param {*} eventData - event data that passed between subscribers.
     * @param {function} callback - function that will be called (if exist), after all subscribers are called. The modified event data form subscribers
     * will be pass as argument of callback functions.
     */
    const emit = (eventName, eventData, callback) => {
        globalEmitterBuss.emit(eventName, eventData, callback);
    };

    return {
        subscribe,
        emit
    };
}
