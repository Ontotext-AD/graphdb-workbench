const modules = [];

angular
    .module('graphdb.framework.utils.event-emitter-service', modules)
    .factory('EventEmitterService', EventEmitterService);

/**
 * A service responsible for emitting events between components. It takes care to registering subscribers and calling them when an event for which they are registered occurs.
 */
function EventEmitterService() {
    const subscribers = {};
    const syncSubscribers = {};

    /**
     * Registers the <code>subscriber</code> for an event with the name <code>eventName</code>.
     * When the event occurs, all subscribers registered to that event will be called sequentially,
     * in the order they were added. Each subscriber is expected to return a promise, and the value
     * resolved by this promise will be passed as input to the next subscriber in the sequence.
     *
     * @param {String} eventName - The name of the event that will trigger the subscriber call.
     * @param {Function} subscriber - A function that returns a promise. This function will be called
     *                                when the event with <code>eventName</code> occurs. The resolved
     *                                value from one subscriber will be passed to the next one.
     *
     * @return {Function} - An unsubscribe function that can be called to remove the subscriber
     *                       from the list of subscribers for this event.
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
     * Emits an event by sequentially calling all subscribers associated with the event name.
     * Each subscriber is expected to return a promise. The resolved value of the promise is passed
     * as the event data to the next subscriber in the sequence. This allows subscribers to modify
     * the event data before it is passed to the next one.
     *
     * Once all subscribers have been executed, an optional callback function is invoked with the
     * final event data.
     *
     * @param {String} eventName - The name of the event to emit.
     * @param {Object} eventData - The initial data to pass to the first subscriber. The data may
     *                             be modified by each subscriber and passed on to the next one.
     * @param {Function} [callback] - Optional callback function to be executed after all subscribers
     *                                have been called, receiving the final event data.
     */
    const emit = (eventName, eventData, callback) => {
        const eventSubscribers = subscribers[eventName] || [];
        const eventSubscribersChain = eventSubscribers.reduce((prev, next) => {
            return prev.then((value) => next(value));
        }, Promise.resolve(eventData));
        eventSubscribersChain.then(() => {
            if (angular.isFunction(callback)) {
                callback(eventData);
            }
        });
    };

    /**
     * Subscribes a callback function to a specified event, allowing it to be called whenever the event is emitted.
     * This function manages the all execution of event subscribers, storing the callback in an array
     * corresponding to the event name. It also provides an unsubscribe function to remove the callback when
     * it's no longer needed.
     *
     * @param {String} eventName - The name of the event to subscribe to.
     * @param {Function} callback - The function to be called when the event is emitted.
     *                              The callback will receive the event data as its argument.
     *
     * @return {Function} - An unsubscribe function that can be called to remove the callback
     *                       from the list of subscribers for this event.
     */
    const subscribeSync = (eventName, callback) => {
        // Initialize the subscriber array for the event if it doesn't exist
        if (!syncSubscribers[eventName]) {
            syncSubscribers[eventName] = [];
        }

        // Add the callback function to the list of subscribers for the event
        syncSubscribers[eventName].push(callback);

        // Return an unsubscribe function
        return function () {
            const index = syncSubscribers[eventName].indexOf(callback);
            if (index !== -1) {
                syncSubscribers[eventName].splice(index, 1);
            }
        };
    };

    /**
     * Emits an event by calling all subscribers associated with the event name in sequence.
     * Each subscriber is expected to process the eventData and then invoke its own callback
     * function (if provided) with the eventData independently.
     *
     * @param {String} eventName - The name of the event to emit.
     * @param {Object} eventData - The data to pass to each subscriber.
     */
    const emitSync = (eventName, eventData) => {
        const eventSubscribers = syncSubscribers[eventName] || [];
        // Execute all subscribers in parallel
        eventSubscribers.forEach((callback) => {
            if (angular.isFunction(callback)) {
                callback(eventData);
            } else {
                console.error(`Callback of "${eventName}" is not function:`, callback);
            }
        });
    };

    return {
        subscribe,
        emit,
        subscribeSync,
        emitSync
    };
}
