import {AuthorityList} from '../../../models/security/authority-list';
import {Mapper} from '../../../providers/mapper/mapper';
import {Authority} from '../../../models/security/authority';

/**
 * Mapper class for converting Authority arrays to AuthorityList models.
 */
export class AuthorityListMapper extends Mapper<AuthorityList> {
  /**
   * Maps an array of Authority objects to an AuthorityList model.
   *
   * @param data - An array of Authority objects to be mapped into an AuthorityList.
   * @returns A new AuthorityList instance containing the provided authorities.
   */
  mapToModel(data: Authority[]): AuthorityList {
    return new AuthorityList(data);
  }
}
