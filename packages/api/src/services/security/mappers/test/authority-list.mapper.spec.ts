import {Authority, AuthorityList} from '../../../../models/security';
import {mapAuthorityListResponseToModel} from '../authority-list.mapper';

describe('AuthorityListMapper', () => {
  test('should map raw authority data to Authority model', () => {
    // Given I have raw authority data
    const rawAuthorityList = ['ROLE_ADMIN', 'ROLE_USER'] as Authority[];

    // When I map the raw authority data to an Authority model
    const authority = mapAuthorityListResponseToModel(rawAuthorityList);

    // Then I expect the Authority model to have the same properties as the raw data
    expect(authority).toEqual(new AuthorityList(rawAuthorityList));
  });

  describe('mapToModel', () => {
    it('should map string array to AuthorityList', () => {
      const data = ['ROLE_USER', 'ROLE_ADMIN'];
      const result = mapAuthorityListResponseToModel(data);

      expect(result).toBeInstanceOf(AuthorityList);
      expect(result.getItems()).toEqual(data);
    });

    it('should handle empty array', () => {
      const data: string[] = [];
      const result = mapAuthorityListResponseToModel(data);

      expect(result.getItems()).toEqual([]);
    });

    it('should treat undefined input as empty list', () => {
      const result = mapAuthorityListResponseToModel(undefined as never);
      expect(result.getItems()).toEqual([]);
    });
  });
});
