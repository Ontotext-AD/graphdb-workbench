import {WindowService} from '../../window';
import {navigate, navigateTo} from '../routing-utils';

describe('Routing Util Functions', () => {

  describe('navigate', () => {
    beforeEach(() => {
      jest.spyOn(WindowService, 'navigateSingleSpa').mockImplementation(jest.fn());
      jest.spyOn(WindowService, 'openWindow').mockImplementation(jest.fn());
    });

    it('should remove leading dot from the URL before navigation', () => {
      navigate('.graphs');
      expect(WindowService.navigateSingleSpa).toHaveBeenCalledWith('graphs');
    });

    it('should add context path to the URL before navigation', () => {
      jest.spyOn(WindowService, 'getBaseHref').mockReturnValue('contextName/');

      navigate('/graphs');
      expect(WindowService.navigateSingleSpa).toHaveBeenCalledWith('contextName/graphs');
    });
  });

  describe('navigateTo', () => {
    beforeEach(() => {
      jest.spyOn(WindowService, 'navigateSingleSpa').mockImplementation(jest.fn());
      jest.spyOn(WindowService, 'openWindow').mockImplementation(jest.fn());
    });

    it('should prevent default event behavior and call navigate', () => {
      const event = { preventDefault: jest.fn() } as unknown as Event;
      navigateTo('/graphs')(event);
      expect(event.preventDefault).toHaveBeenCalled();
      expect(WindowService.navigateSingleSpa).toHaveBeenCalledWith('/graphs');
    });
  });
});
