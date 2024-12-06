import {UriUtil} from './uri-util';

describe('UriUtil', () => {
  test('should shortens an IRI by extracting the hostname and port', () => {
    expect(UriUtil.shortenIri('http://example.com:8080/path')).toBe('example:8080');
    expect(UriUtil.shortenIri('http://example:8080/path')).toBe('example:8080');
  });

  test('should shortens a IPv4 address by extracting the hostname and port', () => {
    expect(UriUtil.shortenIri('http://192.168.1.1:3000/path')).toBe('192.168.1.1:3000');
  });
});
