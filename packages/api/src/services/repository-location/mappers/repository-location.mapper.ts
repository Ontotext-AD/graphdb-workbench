import {RepositoryLocation, RepositoryLocationType} from '../../../models/repository-location';
import {MapperFn} from '../../../providers/mapper/mapper-fn';
import {RepositoryLocationResponse} from '../response/repository-location-response';
import {toEnum} from '../../utils';
import {AuthenticationType} from '../../../models/security';

/**
 * A class containing functions to map various server responses to specific repository location models.
 */
export const mapRepositoryLocationResponseToModel: MapperFn<RepositoryLocationResponse, RepositoryLocation> = (data) => {
  return new RepositoryLocation({
    uri: data.uri,
    label: data.label,
    username: data.username ?? undefined,
    password: data.password ?? undefined,
    authType: data.authType ? toEnum(AuthenticationType, data.authType) : undefined,
    locationType: data.locationType ? toEnum(RepositoryLocationType, data.locationType) : undefined,
    active: data.active,
    local: data.local,
    system: data.system,
    errorMsg: data.errorMsg ?? '',
    defaultRepository: data.defaultRepository ?? undefined,
  });
};
