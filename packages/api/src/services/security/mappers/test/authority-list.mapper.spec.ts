import {Authority, AuthorityList} from '../../../../models/security';
import {AuthorityListMapper} from '../authority-list.mapper';

describe('AuthorityListMapper', () => {
  test('should map raw authority data to Authority model', () => {
    // Given I have raw authority data
    const rawAuthorityList = ['ROLE_ADMIN', 'ROLE_USER'] as Authority[];

    // When I map the raw authority data to an Authority model
    const authority = new AuthorityListMapper().mapToModel(rawAuthorityList);

    // Then I expect the Authority model to have the same properties as the raw data
    expect(authority).toEqual(new AuthorityList(rawAuthorityList));
  });
});
