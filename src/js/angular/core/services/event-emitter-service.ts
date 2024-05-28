import * as angular from 'angular';
const modules = [];

angular
    .module('graphdb.framework.utils.event-emitter-service', modules)
    .factory('EventEmitterService', EventEmitterService);

/**
 * A service responsible for emitting events between components. It takes care to registering subscribers and calling them when an event for which they are registered occurs.
 */
function EventEmitterService() {
    const subscribers = {};

    /**
     * Registers the <code>subscriber</code> for event with name <code>eventName</code>. When event occurred the subscribers will be called.
     * @param eventName - the name of the event that will trigger a subscriber call.
     * @param {Promise<any>} subscriber - promise that will call when event with <code>eventName</code> occurred.
     * @return {(function(): void)|*} - unsubscribe function.
     */
    const subscribe = (eventName, subscriber) => {
        if (!subscribers[eventName]) {
            subscribers[eventName] = [];
        }
        subscribers[eventName].push(subscriber);

        // Return an unsubscribe function
        return function () {
            const index = subscribers[eventName].indexOf(subscriber);
            if (index !== -1) {
                subscribers[eventName].splice(index, 1);
            }
        };
    };

    /**
     * Call all subscribers that are registered for event with <code>eventName</code>.
     * @param eventName - name of event.
     * @param eventData - event data that passed between subscribers.
     * @param callback - function that will be called (if exist), after all subscribers are called. The modified event data form subscribers
     * will be pass as argument of callback functions.
     */
    const emit = (eventName, eventData, callback) => {
        const eventSubscribers = subscribers[eventName] || [];
        const eventSubscribersChain = eventSubscribers.reduce((prev, next) => {
            return prev.then((value) => next(value))
        }, Promise.resolve(eventData));

        eventSubscribersChain.then(() => {
            if (angular.isFunction(callback)) {
                callback(eventData);
            }
        });
    };

    return {
        subscribe,
        emit
    };
}
