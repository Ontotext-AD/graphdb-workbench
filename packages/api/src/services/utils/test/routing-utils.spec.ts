import {WindowService} from '../../window';
import {UrlPathParams} from '../../../models/url';
import {navigate, navigateTo, navigateToLoginPage, buildUrl} from '../routing-utils';

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

  describe('navigateToLoginPage', () => {
    beforeEach(() => {
      jest.spyOn(WindowService, 'navigateSingleSpa').mockImplementation(jest.fn());
      jest.spyOn(WindowService, 'getBaseHref').mockReturnValue('/');
      jest.spyOn(WindowService, 'getLocationQueryParams').mockReturnValue('');
    });

    it('should add the current path as an encoded return url', () => {
      jest.spyOn(WindowService, 'getLocationPathname').mockReturnValue('/sparql');

      navigateToLoginPage();

      expect(WindowService.navigateSingleSpa).toHaveBeenCalledWith('login?r=%2Fsparql');
    });

    it('should keep the query params of the current page in the return url', () => {
      jest.spyOn(WindowService, 'getLocationPathname').mockReturnValue('/sparql');
      jest.spyOn(WindowService, 'getLocationQueryParams').mockReturnValue('?query=SELECT%20*&name=q1');

      navigateToLoginPage();

      expect(WindowService.navigateSingleSpa).toHaveBeenCalledWith(
        'login?r=%2Fsparql%3Fquery%3DSELECT%2520*%26name%3Dq1'
      );
    });

    it('should strip the context path from the return url', () => {
      jest.spyOn(WindowService, 'getBaseHref').mockReturnValue('/graphdb/');
      jest.spyOn(WindowService, 'getLocationPathname').mockReturnValue('/graphdb/graphql/endpoints');

      navigateToLoginPage();

      expect(WindowService.navigateSingleSpa).toHaveBeenCalledWith('login?r=%2Fgraphql%2Fendpoints');
    });

    it('should add the home page as return url when on the home page', () => {
      jest.spyOn(WindowService, 'getLocationPathname').mockReturnValue('/');

      navigateToLoginPage();

      expect(WindowService.navigateSingleSpa).toHaveBeenCalledWith('login?r=%2F');
    });
  });

  describe('navigateToLoginPage return url round trip', () => {
    // Mirrors how the readers of the `r` param decode it: Angular's `queryParamMap.get`
    // (login page) and `URLSearchParams.get` (security bootstrap). Both decode exactly once
    // and both turn a bare '+' into a space, so a single `encodeURIComponent` on the writer
    // side must survive them untouched.
    const readWithUrlSearchParams = (loginUrl: string) =>
      new URLSearchParams(loginUrl.substring(loginUrl.indexOf('?'))).get(UrlPathParams.RETURN_URL);
    const readWithAngularQueryParamMap = (loginUrl: string) => {
      const value = loginUrl.substring(loginUrl.indexOf('=') + 1);
      return decodeURIComponent(value.replace(/\+/g, '%20'));
    };

    const navigateToLoginPageFrom = (pathname: string, queryParams: string): string => {
      jest.spyOn(WindowService, 'navigateSingleSpa').mockImplementation(jest.fn());
      jest.spyOn(WindowService, 'getBaseHref').mockReturnValue('/');
      jest.spyOn(WindowService, 'getLocationPathname').mockReturnValue(pathname);
      jest.spyOn(WindowService, 'getLocationQueryParams').mockReturnValue(queryParams);

      navigateToLoginPage();

      return (WindowService.navigateSingleSpa as jest.Mock).mock.calls[0][0] as string;
    };

    test.each([
      ['a plain route', '/sparql', ''],
      ['a nested route', '/graphql/endpoints', ''],
      ['an encoded space in a query param', '/sparql', '?query=SELECT%20*'],
      ['an encoded ampersand in a query param', '/sparql', '?name=a%26b'],
      ['an encoded slash in a query param', '/sparql', '?name=a%2Fb'],
      ['a plus sign in a query param', '/sparql', '?query=a+b'],
      ['a literal percent sign in a query param', '/sparql', '?query=100%'],
      ['multiple query params', '/sparql', '?query=SELECT%20*&name=q1'],
    ])('should return the original url unchanged for %s', (_description, pathname, queryParams) => {
      const expected = pathname + queryParams;

      const loginUrl = navigateToLoginPageFrom(pathname, queryParams);

      expect(readWithUrlSearchParams(loginUrl)).toEqual(expected);
      expect(readWithAngularQueryParamMap(loginUrl)).toEqual(expected);
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
