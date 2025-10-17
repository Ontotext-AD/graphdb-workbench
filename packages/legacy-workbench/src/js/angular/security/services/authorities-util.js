import {UserRole, UserType, UserUtils} from '../../utils/user-utils';
import {
    CUSTOM_PREFIX,
    GRAPHQL,
    GRAPHQL_PREFIX,
    READ_REPO,
    READ_REPO_PREFIX,
    WRITE_REPO,
    WRITE_REPO_PREFIX,
} from './constants';
import {AuthoritiesUtil} from '@ontotext/workbench-api';

// TODO: Migrate this to use the Authorization service. The problem is with the authorities model. It is either a string[] or a AuthoritiesList instance
export const parseAuthorities = (authorities) => {
    let userType = UserType.USER;
    const grantedAuthorities = {
        [READ_REPO]: {},
        [WRITE_REPO]: {},
        [GRAPHQL]: {},
    };
    const repositories = {};
    const customRoles = [];
    const auths = authorities.getItems ? authorities.getItems() : authorities;
    for (let i = 0; i < auths.length; i++) {
        const role = auths[i];
        if (role === UserRole.ROLE_ADMIN) {
            userType = UserType.ADMIN;
        } else if (role === UserRole.ROLE_REPO_MANAGER) {
            if (userType !== UserType.ADMIN) {
                userType = UserType.REPO_MANAGER;
            }
        } else if (role === UserRole.ROLE_USER) {
            userType = UserType.USER;
        } else if (role.indexOf(READ_REPO_PREFIX) === 0 || role.indexOf(WRITE_REPO_PREFIX) === 0 || role.indexOf(GRAPHQL_PREFIX) === 0) {
            const repoData = AuthoritiesUtil.getRepoFromAuthority(role);
            if (repoData) {
                const {prefix, repo} = repoData;
                repositories[repo] = repositories[repo] || {};
                if (prefix === READ_REPO_PREFIX) {
                    grantedAuthorities[READ_REPO][repo] = true;
                    repositories[repo].read = true;
                } else if (prefix === WRITE_REPO_PREFIX) {
                    grantedAuthorities[WRITE_REPO][repo] = true;
                    repositories[repo].write = true;
                } else if (prefix === GRAPHQL_PREFIX) {
                    grantedAuthorities[GRAPHQL][repo] = true;
                    repositories[repo].graphql = true;
                }
            }
        } else if (role.indexOf(CUSTOM_PREFIX) === 0) {
            customRoles.push(role.substring(CUSTOM_PREFIX.length));
        }
    }

    return {
        userType: userType,
        userTypeDescription: UserUtils.getUserRoleName(userType),
        grantedAuthorities: grantedAuthorities,
        repositories: repositories,
        customRoles: customRoles,
    };
};

export const createUniqueKey = function(repository) {
    if (repository.location) {
        return `${repository.id}@${repository.location}`;
    }
    return repository.id;
};
