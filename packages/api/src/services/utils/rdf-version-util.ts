/**
 * Utility class for requesting a specific RDF version from the backend through the <code>Accept</code> header.
 *
 * The version is announced with the <code>version</code> media type parameter, as defined by RDF 1.2.
 */
export class RdfVersionUtil {
  /**
   * The RDF version the workbench requests from the backend.
   */
  static readonly VERSION = '1.2';

  /**
   * Media types which are not RDF or SPARQL results formats, so the version parameter is meaningless for them.
   * <code>text/plain</code> is deliberately not here, because it is also the media type of N-Triples.
   */
  private static readonly NON_RDF_MEDIA_TYPES = ['application/json'];
  private static readonly VERSION_PARAM = 'version';
  private static readonly WEIGHT_PARAM = 'q';

  /**
   * Adds the RDF version parameter to every RDF media range of an <code>Accept</code> header value.
   *
   * The parameter is placed right after the media type parameters and before the weight (<code>q</code>),
   * because anything after the weight is not a media type parameter. Media ranges which already
   * declare a version and non-RDF media types are left untouched, so calling this more than once is safe.
   *
   * @param accept - The <code>Accept</code> header value. May contain several comma-separated media ranges.
   * @returns The header value with the version added, or the original value if it is empty.
   *
   * @example
   * RdfVersionUtil.withVersion('application/sparql-results+json;q=0.9, *\/*;q=0.8');
   * // Returns: 'application/sparql-results+json;version=1.2;q=0.9, *\/*;version=1.2;q=0.8'
   */
  static withVersion(accept: string): string;
  static withVersion(accept: string | undefined): string | undefined;
  static withVersion(accept: string | undefined): string | undefined {
    if (!accept?.trim()) {
      return accept;
    }
    return accept
      .split(',')
      .map((mediaRange) => RdfVersionUtil.addVersionToMediaRange(mediaRange))
      .join(', ');
  }

  private static addVersionToMediaRange(mediaRange: string): string {
    const [mediaType, ...params] = mediaRange.split(';').map((part) => part.trim());
    const paramNames = params.map((param) => param.split('=')[0].trim().toLowerCase());

    if (RdfVersionUtil.NON_RDF_MEDIA_TYPES.includes(mediaType.toLowerCase()) || paramNames.includes(RdfVersionUtil.VERSION_PARAM)) {
      return [mediaType, ...params].join(';');
    }

    const weightIndex = paramNames.indexOf(RdfVersionUtil.WEIGHT_PARAM);
    const insertAt = weightIndex === -1 ? params.length : weightIndex;
    params.splice(insertAt, 0, `${RdfVersionUtil.VERSION_PARAM}=${RdfVersionUtil.VERSION}`);
    return [mediaType, ...params].join(';');
  }
}
