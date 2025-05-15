import {UriUtil} from '../uri-util';

describe('UriUtil', () => {
  test('shortenIri should shortens an IRI by extracting the hostname and port', () => {
    expect(UriUtil.shortenIri('http://example.com:8080/path')).toBe('example:8080');
    expect(UriUtil.shortenIri('http://example:8080/path')).toBe('example:8080');
  });

  test('shortenIri should shortens a IPv4 address by extracting the hostname and port', () => {
    expect(UriUtil.shortenIri('http://192.168.1.1:3000/path')).toBe('192.168.1.1:3000');
  });

  test('should create a redirect URL for autocomplete', () => {
    const autocompleteUrl = '/resource';
    const resourceUrl = 'http://example.com/resource/123';
    const expectedRedirectUrl = `${autocompleteUrl}?uri=http%3A%2F%2Fexample.com%2Fresource%2F123`;

    const result = UriUtil.createAutocompleteRedirect(autocompleteUrl, resourceUrl);

    expect(result).toBe(expectedRedirectUrl);
  });

  test('should remove angle brackets from a URI', () => {
    const uriWithAngleBrackets = '<http://example.com>';
    const expectedUriWithoutAngleBrackets = 'http://example.com';

    const result = UriUtil.removeAngleBrackets(uriWithAngleBrackets);

    expect(result).toBe(expectedUriWithoutAngleBrackets);
  });

  test('should handle uri with no angle brackets', () => {
    const uriWithoutAngleBrackets = 'http://example.com';
    expect(UriUtil.removeAngleBrackets(uriWithoutAngleBrackets)).toBe(uriWithoutAngleBrackets);
  });

  test('should validate URIs', () => {
    expect(UriUtil.isValidUri('http://example.com')).toBe(true);
    expect(UriUtil.isValidUri('<http://example.com>')).toBe(true);
    expect(UriUtil.isValidUri('urn:alabala')).toBe(true);
    expect(UriUtil.isValidUri('invalid_uri')).toBe(false);
    expect(UriUtil.isValidUri('http://example.com>')).toBe(false);
    expect(UriUtil.isValidUri('<http://example.com')).toBe(false);
  });

  test('should resolve documentation URL', () => {
    const productVersion = '7.0.0';
    const endpointPath = 'endpoint/path';
    const expectedDocumentationUrl = `https://graphdb.ontotext.com/documentation/${productVersion}/endpoint/path`;

    const result = UriUtil.resolveDocumentationUrl(productVersion, endpointPath);

    expect(result).toBe(expectedDocumentationUrl);
  });

  test('should throw an error if product version or endpoint path is not provided', () => {
    const expectedError = 'Product version and endpoint path are required for documentation URL resolution.';
    expect(() => UriUtil.resolveDocumentationUrl('', 'endpoint/path')).toThrow(expectedError);
    expect(() => UriUtil.resolveDocumentationUrl('7.0.0', '')).toThrow(expectedError);
  });
});
