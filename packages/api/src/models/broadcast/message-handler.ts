import {BroadcastMessage} from './broadcast-message';

/**
 * A callback executed when a {@link BroadcastMessage} is received from another browser context.
 */
export type MessageHandler = (message: BroadcastMessage) => void;
