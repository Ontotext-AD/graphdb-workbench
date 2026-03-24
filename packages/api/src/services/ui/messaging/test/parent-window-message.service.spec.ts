import {ParentWindowMessageService} from '../parent-window-message.service';
import {WindowService} from '../../../window';

describe('ParentWindowMessageService', () => {
  let service: ParentWindowMessageService;
  const mockParentWindow = {postMessage: jest.fn()} as unknown as Window;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(WindowService, 'getParentWindow').mockReturnValue(mockParentWindow);
    service = new ParentWindowMessageService();
  });

  describe('postMessage', () => {
    it('should call postMessage on the parent window with the given message and default targetOrigin "*"', () => {
      const message = {type: 'TEST', payload: 'hello'};

      service.postMessage(message);

      expect(WindowService.getParentWindow).toHaveBeenCalledTimes(1);
      expect(mockParentWindow.postMessage).toHaveBeenCalledWith(message, '*');
    });

    it('should call postMessage on the parent window with the given message and a custom targetOrigin', () => {
      const message = 'simple string message';
      const targetOrigin = 'https://example.com';

      service.postMessage(message, targetOrigin);

      expect(WindowService.getParentWindow).toHaveBeenCalledTimes(1);
      expect(mockParentWindow.postMessage).toHaveBeenCalledWith(message, targetOrigin);
    });

    it('should support sending an object message', () => {
      const message = {key: 'value', nested: {num: 42}};

      service.postMessage(message);

      expect(mockParentWindow.postMessage).toHaveBeenCalledWith(message, '*');
    });

    it('should support sending an array message', () => {
      const message = [1, 2, 3];

      service.postMessage(message);

      expect(mockParentWindow.postMessage).toHaveBeenCalledWith(message, '*');
    });

    it('should support sending a null message', () => {
      service.postMessage(null);

      expect(mockParentWindow.postMessage).toHaveBeenCalledWith(null, '*');
    });

    it('should retrieve the parent window on every call', () => {
      service.postMessage('first');
      service.postMessage('second');

      expect(WindowService.getParentWindow).toHaveBeenCalledTimes(2);
    });
  });
});
