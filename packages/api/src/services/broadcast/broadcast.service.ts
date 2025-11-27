import {BroadcastMessage} from '../../models/broadcast';

type MessageHandler = (message: BroadcastMessage) => void;

/**
 * A service that facilitates communication between different browser contexts
 * (such as tabs, windows, or iframes) of the same origin.
 * It uses the `BroadcastChannel` API to send and receive messages.
 */
export class BroadcastService {
  private readonly CHANNEL_NAME = 'ontotext-workbench-broadcast';
  private readonly MESSAGE_EVENT = 'message';

  private channel?: BroadcastChannel;

  /**
   * Sends a message to all listening browser contexts on the same origin.
   * @param {BroadcastMessage} message The message to be sent.
   */
  sendMessage(message: BroadcastMessage): void {
    this.getChannel().postMessage(message);
  }

  /**
   * Subscribes to incoming messages.
   * @param {MessageHandler} callback The function to be executed when a message is received.
   * @returns {() => void} An unsubscribe function.
   */
  onMessageReceived(callback: MessageHandler): () => void {
    const channel = this.getChannel();
    const listener = (event: MessageEvent) => callback(event.data);

    channel.addEventListener(this.MESSAGE_EVENT, listener);
    return () => channel.removeEventListener(this.MESSAGE_EVENT, listener);
  }

  private getChannel(): BroadcastChannel {
    if (!this.channel) {
      this.channel = new BroadcastChannel(this.CHANNEL_NAME);
    }
    return this.channel;
  }
}
