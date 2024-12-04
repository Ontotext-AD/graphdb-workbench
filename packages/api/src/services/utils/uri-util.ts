/**
 * Utility class for handling and manipulating URIs.
 */
export class UriUtil {

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
}
