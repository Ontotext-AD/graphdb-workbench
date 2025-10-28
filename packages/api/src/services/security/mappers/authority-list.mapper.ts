import {AuthorityList} from '../../../models/security/authorization/authority-list';
import {Mapper} from '../../../providers/mapper/mapper';

/**
 * Mapper class for converting Authority arrays to AuthorityList models.
 */
export class AuthorityListMapper extends Mapper<AuthorityList> {
  /**
   * Maps an array of Authority strings to an AuthorityList model.
   *
   * @param data - An array of Authority strings to be mapped into an AuthorityList.
   * @returns A new AuthorityList instance containing the provided authorities.
   */
  mapToModel(data: string[]): AuthorityList {
    return new AuthorityList(data);
  }
}
