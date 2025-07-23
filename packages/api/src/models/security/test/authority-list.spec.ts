import { AuthorityList } from '../authority-list';

describe('AuthorityList', () => {
  describe('hasAuthority', () => {
    const authorities = ['ROLE_USER', 'ROLE_ADMIN'];
    const list = new AuthorityList(authorities);

    it('should return true if authority is present', () => {
      expect(list.hasAuthority('ROLE_USER')).toBe(true);
    });

    it('should return false if authority is not present', () => {
      expect(list.hasAuthority('ROLE_MONITORING')).toBe(false);
    });

    it('should return false for any authority when list is empty', () => {
      const emptyList = new AuthorityList();
      expect(emptyList.hasAuthority('ROLE_USER')).toBe(false);
      expect(emptyList.hasAuthority('')).toBe(false);
    });
  });
});
