export class EventEmitterService {

    constructor() {
        this._subscribers = {};
    }


    /**
     * Registers the <code>subscriber</code> for event with name <code>eventName</code>. When event occurred the subscribers will be called.
     * @param {string} eventName - the name of the event that will trigger a subscriber call.
     * @param {Promise<any>} subscriber - promise that will call when event with <code>eventName</code> occurred.
     * @return {(function(): void)|*} - unsubscribe function.
     */
    subscribe(eventName, subscriber) {
        if (!this._subscribers[eventName]) {
            this._subscribers[eventName] = [];
        }
        this._subscribers[eventName].push(subscriber);

        // Return an unsubscribe function
        return () => {
            const index = this._subscribers[eventName].indexOf(subscriber);
            if (index !== -1) {
                this._subscribers[eventName].splice(index, 1);
            }
        };
    }

    /**
     * Call all subscribers that are registered for event with <code>eventName</code>.
     * @param {string} eventName - name of event.
     * @param {*} eventData - event data that passed between subscribers.
     * @param {function} callback - function that will be called (if exist), after all subscribers are called. The modified event data form subscribers
     * will be pass as argument of callback functions.
     */
    emit(eventName, eventData, callback) {
        const eventSubscribers = this._subscribers[eventName] || [];
        const eventSubscribersChain = eventSubscribers.reduce((prev, next) => {
            return prev.then((value) => next(value));
        }, Promise.resolve(eventData));

        eventSubscribersChain.then(() => {
            if (angular.isFunction(callback)) {
                callback(eventData);
            }
        });
    }
}
