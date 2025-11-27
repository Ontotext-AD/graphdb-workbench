import {MessageType} from './message-type';

/**
 * BroadcastMessage represents a message that can be broadcasted to all browser contexts.
 * No methods should be added here, since the broadcast API uses structured cloning to transfer messages,
 * which removes any methods from the message.
 */
export class BroadcastMessage {
  readonly type: MessageType;
  readonly params?: unknown;

  constructor(type: MessageType, params?: unknown) {
    this.type = type;
    this.params = params;
  }
}
