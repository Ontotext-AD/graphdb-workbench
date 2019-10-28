import {UserUtils, UserType} from 'angular/utils/user-utils';

describe('UserUtils', () => {
    it('should return role name using the user type', () => {
        expect(UserUtils.getUserRoleName(UserType.USER)).toEqual('User');
        expect(UserUtils.getUserRoleName(UserType.ADMIN)).toEqual('Administrator');
        expect(UserUtils.getUserRoleName(UserType.REPO_MANAGER)).toEqual('Repository manager');
        expect(UserUtils.getUserRoleName('unknown_type')).toEqual('Unknown');
    });
});
