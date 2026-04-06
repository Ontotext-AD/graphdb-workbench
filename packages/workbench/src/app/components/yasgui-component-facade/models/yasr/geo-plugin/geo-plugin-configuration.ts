import {PluginConfiguration} from '../plugin-configuration';
import {GeoStyleOptions} from './geo-style-options';
import {GeoFeatureClickHandler} from './geo-feature-click-handler';

/**
 * Configuration class for the Geo plugin.
 */
export class GeoPluginConfiguration implements PluginConfiguration {

  /**
   * Default style options applied to all Geo features unless overridden.
   */
  public defaultGeoStyleOptions: GeoStyleOptions;

  /**
   * Callback invoked when a geospatial feature is clicked, if present.
   *
   * @param nonGeoProperties - Feature properties excluding geospatial-specific fields.
   */
  public onFeatureClick?: GeoFeatureClickHandler;

  constructor() {
    this.defaultGeoStyleOptions = new GeoStyleOptions();
  }
}
