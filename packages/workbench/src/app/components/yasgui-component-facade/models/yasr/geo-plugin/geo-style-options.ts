/**
 * Holds all options related with styling of geo features.
 */
export class GeoStyleOptions {
  /**
   * Width of the geo feature line.
   */
  public weight = 3;

  /**
   * Color of the geo feature line.
   */
  public color= 'var(--graphwise-blue-color)';

  /**
   * Opacity of the geo feature line,
   */
  public opacity = 0.7;

  /**
   * Fill color of polygon features.
   */
  public fillColor= 'var(--graphwise-blue-color)';

  /**
   * Fill opacity of polygon features,
   */
  public fillOpacity = 0.2;
}
