import {cloneDeep} from "lodash";

/**
 * Core service for creating context that can be used in components.
 */
export class ComponentStoreService {

    constructor(EventEmitterService) {
        this.eventEmitterService = EventEmitterService;
        this._serviceContext = {};
    }

    /**
     * Fetches the value of a property.
     * @param {string} propertyName - The property name of the value of interest.
     * @return {*} The value of the property with the name <code>propertyName</code>.
     */
    get(propertyName) {
        return cloneDeep(this._serviceContext[propertyName]);
    }

    /**
     * Updates the property with the name <code>propertyName</code>. After the property is updated, an update event will be fired to notify all subscribers.
     * @param {string} propertyName - The property name of the value of interest.
     * @param {*} value - The new value of the property.
     */
    update(propertyName, value) {
        this._serviceContext[propertyName] = value;
        this.eventEmitterService.emit(this.getUpdateEventName(propertyName), this.get(propertyName));
    }

    /**
     * Subscribes to the update property event.
     * @param {string} propertyName - the property name of interest.
     * @param {function} callback - The callback to be called when the event is fired.
     *
     * @return {function} unsubscribe function.
     */
    onUpdated(propertyName, callback) {
        return this.eventEmitterService.subscribe(this.getUpdateEventName(propertyName), () => callback(this.get(propertyName)));
    }

    getUpdateEventName(propertyName) {
        return propertyName + 'Updated';
    }
}
