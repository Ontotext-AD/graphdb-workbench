import {AuthenticationType} from '../security';
import {LocationType} from './location-type';
import {Model} from '../common';

/**
 * Holds information about a location instance.
 */
export class Location extends Model<Location> {
  /**
   * The GraphDB location URL.
   */
  uri: string;

  /**
   * Human-readable label.
   */
  label: string;

  /**
   * Username for the location if any.
   */
  username: string | undefined;

  /**
   * Password for the location if any.
   */
  password: string | undefined;

  /**
   * Authentication type. This is related only for GraphDB remote instances.
   */
  authType: AuthenticationType;

  /**
   * Remote location type.
   */
  locationType: LocationType;

  /**
   * True if the location is the currently active.
   */
  active: boolean;

  /**
   * True if the location is local (on the same machine as the workbench).
   */
  local: boolean;

  /**
   * True if the location is the system location.
   */
  system: boolean;

  /**
   * Error message, if there was an error connecting to this location
   */
  errorMsg: string | undefined;

  /**
   * Default repository for the location.
   */
  defaultRepository: string | undefined;

  constructor(data: Omit<Location, 'copy'>) {
    super();
    this.uri = data.uri;
    this.label = data.label;
    this.username = data.username;
    this.password = data.password;
    this.authType = data.authType;
    this.locationType = data.locationType;
    this.active = data.active;
    this.local = data.local;
    this.system = data.system;
    this.errorMsg = data.errorMsg;
    this.defaultRepository = data.defaultRepository;
  }
}
