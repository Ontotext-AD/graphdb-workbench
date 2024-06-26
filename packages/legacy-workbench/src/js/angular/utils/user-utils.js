const UserRole = Object.freeze({
    'ROLE_ADMIN': 'ROLE_ADMIN',
    'ROLE_USER': 'ROLE_USER',
    'ROLE_REPO_MANAGER': 'ROLE_REPO_MANAGER',
    'ROLE_MONITORING': 'ROLE_MONITORING'
});

const UserType = Object.freeze({
    'ADMIN': 'admin',
    'USER': 'user',
    'REPO_MANAGER': 'repoManager'
});

const UserUtils = (function () {
    const getUserRoleName = function (userType) {
        switch (userType) {
            case UserType.USER:
                return 'User';
            case UserType.REPO_MANAGER:
                return 'Repository manager';
            case UserType.ADMIN:
                return 'Administrator';
            default:
                return 'Unknown';
        }
    };

    return {
        getUserRoleName
    };
})();

export {
  UserType,
  UserRole,
  UserUtils
};
