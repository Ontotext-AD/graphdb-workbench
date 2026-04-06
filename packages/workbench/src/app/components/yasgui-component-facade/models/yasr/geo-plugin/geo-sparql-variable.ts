/**
 * Enum with all variables that can be used in a SPARQL query to customize the GeoSPARQL plugin.
 */
export enum GeoSparqlVariable {
  /**
   * Content displayed inside a popup when a map feature is clicked.
   */
  FIGURE_POPUP_CONTENT = 'geo_popup',

  /**
   * Text displayed as a tooltip when hovering over a map feature.
   */
  FIGURE_TOOLTIP = 'geo_tooltip',

  /**
   * Width of the feature line.
   */
  FIGURE_WEIGHT = 'geo_weight',

  /**
   * Color of the figure line.
   */
  FIGURE_COLOR = 'geo_color',

  /**
   * Opacity of the figure line.
   */
  FIGURE_OPACITY = 'geo_opacity',

  /**
   * Fill color of polygons.
   */
  FIGURE_FILL_COLOR = 'geo_fillColor',

  /**
   * Fill opacity of polygons.
   */
  FIGURE_FILL_OPACITY = 'geo_fillOpacity',
}

