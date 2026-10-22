import '@angular/compiler';
import {ActivatedRouteSnapshot, RouterStateSnapshot} from '@angular/router';
import {BuildUtil, ProductInfo, ProductInfoContextService, service} from '@ontotext/workbench-api';
import {documentationLinkResolve} from './route-data-resolver';

describe('documentationLinkResolve', () => {
  let getProductInfo: jest.SpyInstance;
  let isDevMode: jest.SpyInstance;

  const resolve = (documentationUrl?: string) => {
    const route = new ActivatedRouteSnapshot();
    route.data = documentationUrl === undefined ? {} : {documentationUrl};
    return documentationLinkResolve(route, {} as RouterStateSnapshot);
  };

  const productInfo = (productVersion: string) => new ProductInfo({
    productVersion,
    productType: 'GraphDB',
    workbench: '',
    sesame: '',
    connectors: '',
    ontop: ''
  });

  beforeEach(() => {
    getProductInfo = jest.spyOn(service(ProductInfoContextService), 'getProductInfo')
      .mockReturnValue(productInfo('10.8.0'));
    isDevMode = jest.spyOn(BuildUtil, 'isDevMode').mockReturnValue(false);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('returns an empty string when the route has no documentation URL', () => {
    expect(resolve()).toBe('');
  });

  it('returns an empty string when product info is unavailable', () => {
    getProductInfo.mockReturnValue(undefined);

    expect(resolve('sparql-queries.html')).toBe('');
  });

  it('uses the short version for a release build', () => {
    expect(resolve('sparql-queries.html'))
      .toBe('https://graphdb.ontotext.com/documentation/10.8/sparql-queries.html');
  });

  it('uses master in dev mode even with a release version', () => {
    isDevMode.mockReturnValue(true);

    expect(resolve('sparql-queries.html'))
      .toBe('https://graphdb.ontotext.com/documentation/master/sparql-queries.html');
  });

  it('uses master for an unofficial version outside dev mode', () => {
    getProductInfo.mockReturnValue(productInfo('11.0.0-M1'));

    expect(resolve('sparql-queries.html'))
      .toBe('https://graphdb.ontotext.com/documentation/master/sparql-queries.html');
  });
});
