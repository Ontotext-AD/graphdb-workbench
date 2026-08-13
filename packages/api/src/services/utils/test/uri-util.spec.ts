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

  test('should validate absolute URIs with schemes other than http and urn', () => {
    expect(UriUtil.isValidUri('https://example.com/resource')).toBe(true);
    expect(UriUtil.isValidUri('<ftp://example.com/data.rdf>')).toBe(true);
    expect(UriUtil.isValidUri('mailto:user@example.com')).toBe(true);
    expect(UriUtil.isValidUri('file:///data/graph.ttl')).toBe(true);
    expect(UriUtil.isValidUri('did:example:123')).toBe(true);
    expect(UriUtil.isValidUri('doi:10.1000/182')).toBe(true);
    expect(UriUtil.isValidUri('xyz://abc#thing')).toBe(true);
  });

  test('should validate a urn whose namespace specific string contains "http"', () => {
    expect(UriUtil.isValidUri('urn:example:http-server')).toBe(true);
    expect(UriUtil.isValidUri('<urn:example:https>')).toBe(true);
  });

  test('should validate URIs with an upper case scheme', () => {
    expect(UriUtil.isValidUri('HTTP://example.com')).toBe(true);
    expect(UriUtil.isValidUri('URN:alabala')).toBe(true);
  });

  test('should reject URIs without a scheme or a scheme specific part', () => {
    expect(UriUtil.isValidUri('')).toBe(false);
    expect(UriUtil.isValidUri(undefined as unknown as string)).toBe(false);
    expect(UriUtil.isValidUri('example.com/resource')).toBe(false);
    expect(UriUtil.isValidUri(':no-scheme')).toBe(false);
    expect(UriUtil.isValidUri('1nvalid:scheme')).toBe(false);
    expect(UriUtil.isValidUri('invalid scheme:value')).toBe(false);
    expect(UriUtil.isValidUri('urn:')).toBe(false);
    expect(UriUtil.isValidUri('mailto:')).toBe(false);
  });

  test('should reject hierarchical URIs without an authority', () => {
    expect(UriUtil.isValidUri('http://')).toBe(false);
    expect(UriUtil.isValidUri('https://')).toBe(false);
    expect(UriUtil.isValidUri('http:example.com')).toBe(false);
    expect(UriUtil.isValidUri('ftp://')).toBe(false);
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
