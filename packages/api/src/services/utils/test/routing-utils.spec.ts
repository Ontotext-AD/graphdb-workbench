import {WindowService} from '../../window';
import {UrlPathParams} from '../../../models/url';
import {navigate, navigateTo, navigateToLoginPage} from '../routing-utils';

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
      expect(WindowService.navigateSingleSpa).toHaveBeenCalledWith('/graphs');
    });
  });
});
