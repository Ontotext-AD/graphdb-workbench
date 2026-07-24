import {WindowService} from '../../window';
import {navigate, navigateTo, buildUrl} from '../routing-utils';

describe('Routing Util Functions', () => {

  describe('navigate', () => {
    beforeEach(() => {
      jest.spyOn(WindowService, 'navigateSingleSpa').mockImplementation(jest.fn());
      jest.spyOn(WindowService, 'openWindow').mockImplementation(jest.fn());
    });

    it('should remove leading dot from the URL before navigation', () => {
      navigate('./graphs');
      expect(WindowService.navigateSingleSpa).toHaveBeenCalledWith('http://localhost/graphs');
    });

    it('should add context path to the URL when the url is absolute', () => {
      jest.spyOn(WindowService, 'getBaseHref').mockReturnValue('/contextName/');

      navigate('/graphs');
      expect(WindowService.navigateSingleSpa).toHaveBeenCalledWith('http://localhost/contextName/graphs');
    });

    it('should append query parameters, stringifying values and skipping nullish ones', () => {
      navigate('reactodia', {query: 'select *', inference: true, sameAs: false, config: undefined, owner: null});
      expect(WindowService.navigateSingleSpa).toHaveBeenCalledWith('http://localhost/reactodia?query=select+*&inference=true&sameAs=false');
    });

    it('should merge query parameters into a URL that already has a query string', () => {
      navigate('reactodia?embedded=true', {query: 'x'});
      expect(WindowService.navigateSingleSpa).toHaveBeenCalledWith('http://localhost/reactodia?embedded=true&query=x');
    });

    it('should include the context path exactly once when deployed behind a reverse proxy', () => {
      // A reverse proxy serves the Workbench under a context path exposed via the <base> href.
      jest.spyOn(WindowService, 'getBaseHref').mockReturnValue('/graphdb/');

      navigate('reactodia', {query: 'select *', inference: true});
      expect(WindowService.navigateSingleSpa).toHaveBeenCalledWith('http://localhost/graphdb/reactodia?query=select+*&inference=true');
    });
  });

  describe('buildUrl', () => {
    it('should return the URL unchanged when no params are provided', () => {
      expect(buildUrl('reactodia')).toBe('http://localhost/reactodia');
    });

    it('should return the URL unchanged when all params are nullish', () => {
      expect(buildUrl('reactodia', {config: undefined, owner: null})).toBe('http://localhost/reactodia');
    });

    it('should append params, stringifying values and skipping nullish ones', () => {
      expect(buildUrl('reactodia', {query: 'select *', inference: true, sameAs: false, config: undefined, owner: null}))
        .toBe('http://localhost/reactodia?query=select+*&inference=true&sameAs=false');
    });

    it('should merge params into a URL that already has a query string', () => {
      expect(buildUrl('reactodia?embedded=true', {query: 'x'})).toBe('http://localhost/reactodia?embedded=true&query=x');
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
      expect(WindowService.navigateSingleSpa).toHaveBeenCalledWith('http://localhost/graphs');
    });
  });
});
