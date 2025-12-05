import {RepositoryLocationType} from './repository-location-type';
import {AuthenticationType} from '../security';

export interface RepositoryLocationResponse {
  uri?: string;
  label?: string;
  username?: string;
  password?: string;
  authType?: AuthenticationType;
  locationType?: RepositoryLocationType;
  active?: boolean;
  local?: boolean;
  system?: boolean;
  errorMsg?: string;
  defaultRepository?: string;
}
