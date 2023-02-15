/**
 * Holds all possible notification message types fired by "ontotext-yasgui".
 */
export class NotificationMessageType {
    static get SUCCESS() {
        return 'success';
    }

    static get WARNING() {
        return 'warning';
    }

    static get ERROR() {
        return 'error';
    }
}
