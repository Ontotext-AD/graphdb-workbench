import {AuthorityList} from '../../../models/security/authorization/authority-list';
import {MapperFn} from '../../../providers/mapper/mapper-fn';

/**
 * Mapper class for converting Authority arrays to AuthorityList models.
 */
export const mapAuthorityListResponseToModel: MapperFn<string[], AuthorityList> = (data) => {
  return new AuthorityList(data);
};
