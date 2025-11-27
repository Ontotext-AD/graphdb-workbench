import {BroadcastService} from '../broadcast.service';
import {BroadcastMessage, MessageType} from '../../../models/broadcast';

type ChannelListener = (event: MessageEvent) => void;

describe('BroadcastService', () => {
  const CHANNEL_NAME = 'ontotext-workbench-broadcast';

  let channel: {
    postMessage: jest.Mock;
    addEventListener: jest.Mock;
    removeEventListener: jest.Mock;
  };
  let channelConstructor: jest.Mock;
  let broadcastService: BroadcastService;

  /**
   * Returns the listener the service registered on the channel with the given subscription.
   * @param {number} subscriptionIndex The order in which the subscription was made.
   * @returns {ChannelListener} The registered listener.
   */
  const registeredListener = (subscriptionIndex = 0): ChannelListener => {
    return channel.addEventListener.mock.calls[subscriptionIndex][1];
  };

  beforeEach(() => {
    channel = {
      postMessage: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    };
    // jsdom does not implement BroadcastChannel, so the global has to be provided, not spied on.
    channelConstructor = jest.fn(() => channel);
    (globalThis as unknown as Record<string, unknown>).BroadcastChannel = channelConstructor;

    broadcastService = new BroadcastService();
  });

  afterEach(() => {
    delete (globalThis as unknown as Record<string, unknown>).BroadcastChannel;
  });

  describe('channel management', () => {
    test('should not open a channel until the service is used', () => {
      expect(channelConstructor).not.toHaveBeenCalled();
    });

    test('should open a single named channel shared by senders and subscribers', () => {
      broadcastService.sendMessage(new BroadcastMessage(MessageType.REPOSITORIES_UPDATED));
      broadcastService.sendMessage(new BroadcastMessage(MessageType.REPOSITORIES_UPDATED));
      broadcastService.subscribeToMessages(jest.fn());
      broadcastService.subscribeToMessages(jest.fn());

      expect(channelConstructor).toHaveBeenCalledTimes(1);
      expect(channelConstructor).toHaveBeenCalledWith(CHANNEL_NAME);
    });
  });

  describe('sendMessage', () => {
    test('should post the message to the channel', () => {
      const message = new BroadcastMessage(MessageType.REPOSITORIES_UPDATED);

      broadcastService.sendMessage(message);

      expect(channel.postMessage).toHaveBeenCalledTimes(1);
      expect(channel.postMessage).toHaveBeenCalledWith(message);
    });

    test('should post the message with its params untouched', () => {
      const params = {repositoryId: 'repo-one', location: 'http://example.com:7300'};

      broadcastService.sendMessage(new BroadcastMessage(MessageType.REPOSITORIES_UPDATED, params));

      expect(channel.postMessage).toHaveBeenCalledWith(
        expect.objectContaining({type: MessageType.REPOSITORIES_UPDATED, params})
      );
    });
  });

  describe('subscribeToMessages', () => {
    test('should subscribe for message events on the channel', () => {
      broadcastService.subscribeToMessages(jest.fn());

      expect(channel.addEventListener).toHaveBeenCalledTimes(1);
      expect(channel.addEventListener).toHaveBeenCalledWith('message', expect.any(Function));
    });

    test('should hand the callback the message itself, not the event wrapping it', () => {
      const callback = jest.fn();
      const message = new BroadcastMessage(MessageType.REPOSITORIES_UPDATED, {repositoryId: 'repo-one'});
      broadcastService.subscribeToMessages(callback);

      registeredListener()({data: message} as MessageEvent);

      expect(callback).toHaveBeenCalledTimes(1);
      expect(callback).toHaveBeenCalledWith(message);
    });

    test('should notify every subscriber', () => {
      const firstCallback = jest.fn();
      const secondCallback = jest.fn();
      const message = new BroadcastMessage(MessageType.REPOSITORIES_UPDATED);
      broadcastService.subscribeToMessages(firstCallback);
      broadcastService.subscribeToMessages(secondCallback);

      registeredListener(0)({data: message} as MessageEvent);
      registeredListener(1)({data: message} as MessageEvent);

      expect(firstCallback).toHaveBeenCalledWith(message);
      expect(secondCallback).toHaveBeenCalledWith(message);
    });
  });

  describe('unsubscribing', () => {
    test('should remove the same listener it registered', () => {
      const unsubscribe = broadcastService.subscribeToMessages(jest.fn());

      unsubscribe();

      expect(channel.removeEventListener).toHaveBeenCalledTimes(1);
      expect(channel.removeEventListener).toHaveBeenCalledWith('message', registeredListener());
    });

    test('should leave the remaining subscribers registered', () => {
      const survivingCallback = jest.fn();
      const unsubscribe = broadcastService.subscribeToMessages(jest.fn());
      broadcastService.subscribeToMessages(survivingCallback);

      unsubscribe();

      expect(channel.removeEventListener).toHaveBeenCalledTimes(1);
      expect(channel.removeEventListener).not.toHaveBeenCalledWith('message', registeredListener(1));

      // The surviving subscriber still receives messages.
      const message = new BroadcastMessage(MessageType.REPOSITORIES_UPDATED);
      registeredListener(1)({data: message} as MessageEvent);
      expect(survivingCallback).toHaveBeenCalledWith(message);
    });
  });
});
