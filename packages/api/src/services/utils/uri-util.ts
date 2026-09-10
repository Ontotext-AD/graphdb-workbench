import {BuildUtil} from './build-util';

/**
 * Utility class for handling and manipulating URIs.
 */
export class UriUtil {
  private static readonly IRI_SCHEME_REGEX = /^[a-zA-Z][a-zA-Z0-9+\-.]*$/;
  private static readonly AUTHORITY_PREFIX = '//';
  // http(s) IRIs are always hierarchical, so they stay rejected without an authority.
  private static readonly HIERARCHICAL_SCHEMES = ['http', 'https'];
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
   * Validates if a string is a properly formatted absolute URI.
   *
   * The function checks that the URI carries a syntactically valid scheme
   * (a letter followed by letters, digits, `+`, `-` or `.`) and a non-empty
   * scheme-specific part. Any registered or custom scheme is accepted, so
   * `ftp:`, `mailto:`, `file:` and `did:` IRIs validate the same way `http:`
   * and `urn:` ones do. Hierarchical URIs must carry an authority after the
   * schema slashes (//), and angle brackets, when present, must be balanced.
   *
   * @param uri - The string to validate as a URI.
   * @returns `true` if the string is a valid URI, otherwise `false`.
   */
  static isValidUri(uri: string): boolean {
    if (!uri || !this.hasBalancedAngleBrackets(uri)) {
      return false;
    }

    const iri = this.removeAngleBrackets(uri);
    const schemeSeparatorIdx = iri.indexOf(':');
    if (schemeSeparatorIdx < 0) {
      return false;
    }

    const scheme = iri.substring(0, schemeSeparatorIdx);
    if (!this.IRI_SCHEME_REGEX.test(scheme)) {
      return false;
    }

    const schemeSpecificPart = iri.substring(schemeSeparatorIdx + 1);
    if (schemeSpecificPart.startsWith(this.AUTHORITY_PREFIX)) {
      return schemeSpecificPart.length > this.AUTHORITY_PREFIX.length;
    }
    return !this.HIERARCHICAL_SCHEMES.includes(scheme.toLowerCase()) && schemeSpecificPart.length > 0;
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
  static resolveDocumentationUrl(productVersion?: string, endpointPath?: string): string {
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

  private static hasBalancedAngleBrackets(uri: string): boolean {
    return this.hasNoAngleBrackets(uri) || this.hasAngleBrackets(uri);
  }
}
