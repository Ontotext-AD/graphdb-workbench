import {BuildUtil} from './build-util';

/**
 * Utility class for handling and manipulating URIs.
 */
export class UriUtil {
  private static readonly ABS_URI_REGEX = /^<?(http|urn).*>?/;
  static GRAPHS_VISUALIZATIONS_URL = 'graphs-visualizations';
  static RESOURCE_URL = 'resource';
  static BASE_DOCUMENTATION_URL = 'https://graphdb.ontotext.com/documentation/';
  static LATEST_UNOFFICIAL_VERSION = 'master';

  /**
   * Shortens an IRI (Internationalized Resource Identifier) by extracting the hostname and port.
   * If the hostname is not an IPv4 address, only the first segment of the domain is used.
   *
   * @param iri - The full IRI to shorten.
   * @returns A shortened version of the IRI in the format `hostname:port`.
   *
   * @example
   * // Shorten an IRI with a full domain name
   * const iri = "http://example.com:8080/path";
   * console.log(UriUtil.shortenIri(iri)); // Outputs "example:8080"
   *
   * @example
   * // Shorten an IRI with an IPv4 address
   * const iri = "http://192.168.1.1:3000/path";
   * console.log(UriUtil.shortenIri(iri)); // Outputs "192.168.1.1:3000"
   */
  static shortenIri(iri: string): string {
    const parser = document.createElement('a');

    parser.href = iri;
    let hostname = parser.hostname;
    if (!UriUtil.containsIPV4(parser.hostname)) {
      hostname = parser.hostname.split('.')[0];
    }
    return hostname + ':' + parser.port;
  }

  /**
   * Checks whether a given hostname contains an IPv4 address.
   *
   * An IPv4 address consists of four blocks of numbers (0-255) separated by dots.
   *
   * @param ip - The hostname or IP address to check.
   * @returns `true` if the hostname is a valid IPv4 address, otherwise `false`.
   *
   * @example
   * // Check an IPv4 address
   * console.log(UriUtil.containsIPV4("192.168.1.1")); // Outputs true
   *
   * @example
   * // Check a non-IPv4 hostname
   * console.log(UriUtil.containsIPV4("example.com")); // Outputs false
   */
  static containsIPV4(ip: string) {
    const blocks = ip.split('.');
    for (let i = 0, sequence = 0; i < blocks.length; i++) {
      if (parseInt(blocks[i], 10) >= 0 && parseInt(blocks[i], 10) <= 255) {
        sequence++;
      } else {
        sequence = 0;
      }
      if (sequence === 4) {
        return true;
      }
    }
    return false;
  }

  /**
   * Creates a redirect URL for autocomplete suggestions.
   *
   * @param redirectUrl - The base URL for the redirect.
   * @param resourceUri - The URI of the autocomplete suggestion.
   */
  static createAutocompleteRedirect(redirectUrl: string, resourceUri: string): string {
    return `${redirectUrl}?uri=${encodeURIComponent(resourceUri)}`;
  }

  /**
   * Removes angle brackets from a URI if they are present.
   *
   * This function checks if a URI is enclosed in angle brackets (< and >)
   * and removes them if they exist. This is useful for handling URIs in
   * different formats, particularly when working with RDF data where URIs
   * are often enclosed in angle brackets.
   *
   * @param uri - The URI string that may or may not be enclosed in angle brackets.
   * @returns The URI with angle brackets removed if they were present, otherwise the original URI.
   */
  static removeAngleBrackets(uri: string): string {
    if (uri?.startsWith('<') && uri?.endsWith('>')) {
      return uri.substring(1, uri.length - 1);
    }
    return uri;
  }

  /**
   * Validates if a string is a properly formatted URI.
   *
   * The function checks if the URI has a valid protocol (http(s) or urn)
   * and proper structure. For HTTP URIs, it verifies the presence of
   * schema slashes (//) and content after them. For URN URIs, it checks
   * if there's content after the "urn:" prefix.
   *
   * @param uri - The string to validate as a URI.
   * @returns `true` if the string is a valid URI, otherwise `false`.
   */
  static isValidUri(uri: string): boolean {
    let valid = false;
    if (this.hasValidProtocol(uri)) {
      if (uri.indexOf('http') >= 0) {
        const schemaSlashesIdx = uri.indexOf('//');
        valid = schemaSlashesIdx > 4
          && uri.substring(schemaSlashesIdx + 2).length > 0;
      } else if (uri.indexOf('urn') >= 0) {
        valid = uri.substring(4).length > 0;
      }
    }
    return valid;
  }

  /**
   * Resolves a documentation URL based on the product version and endpoint path.
   *
   * This function constructs a complete documentation URL by combining the base documentation URL
   * with the appropriate version and endpoint path. For unofficial versions (containing a hyphen)
   * or when in development mode, it uses the latest unofficial version instead of the provided version.
   *
   * @param productVersion - The version of the product for which to retrieve documentation.
   *                         If it contains a hyphen, it's considered an unofficial version.
   * @param endpointPath - The specific documentation endpoint path to append to the URL.
   * @returns A complete documentation URL string pointing to the specified resource.
   * @throws {Error} If either productVersion or endpointPath is not provided.
   *
   * @example
   * const docUrl = UriUtil.resolveDocumentationUrl('10.0.0', 'sparql-endpoint');
   * // Returns: 'https://graphdb.ontotext.com/documentation/10.0.0/sparql-endpoint'
   */
  static resolveDocumentationUrl(productVersion: string, endpointPath: string): string {
    if (!productVersion || !endpointPath) {
      throw new Error('Product version and endpoint path are required for documentation URL resolution.');
    }

    const isUnofficialVersion = productVersion.includes('-');
    const version = (BuildUtil.isDevMode() || isUnofficialVersion) ? this.LATEST_UNOFFICIAL_VERSION : productVersion;
    return `${this.BASE_DOCUMENTATION_URL}${version}/${endpointPath}`;
  }

  private static hasAngleBrackets(uri: string): boolean {
    return uri.startsWith('<') && uri.endsWith('>');
  }

  private static hasNoAngleBrackets(uri: string): boolean {
    return !uri.startsWith('<') && !uri.endsWith('>');
  }

  private static hasValidProtocol(uri: string): boolean {
    return this.ABS_URI_REGEX.test(uri) && (this.hasNoAngleBrackets(uri) || this.hasAngleBrackets(uri));
  }
}
