import {AuthorityList} from '../../../models/security/authority-list';
import {Mapper} from '../../../providers/mapper/mapper';
import {Authority} from '../../../models/security/authority';

/**
 * Mapper class for converting Authority arrays to AuthorityList models.
 */
export class AuthorityListMapper extends Mapper<AuthorityList> {
  private isAuthorityArray(raw: unknown): raw is Authority[] {
    return Array.isArray(raw) && raw.every(v =>
      typeof v === 'string' && (Object.values(Authority) as string[]).includes(v)
    );
  }
  /**
   * Maps an array of Authority objects to an AuthorityList model.
   *
   * @param data - An array of Authority objects to be mapped into an AuthorityList.
   * @returns A new AuthorityList instance containing the provided authorities.
   */
  mapToModel(data: unknown): AuthorityList {
    if (data instanceof AuthorityList) {
      return data;
    }
    const list = this.isAuthorityArray(data) ? data : [];
    return new AuthorityList(list);
  }
}
