import {UserRole, UserType, UserUtils} from "../../utils/user-utils";
import {
    CUSTOM_PREFIX,
    GRAPHQL,
    GRAPHQL_PREFIX,
    READ_REPO,
    READ_REPO_PREFIX,
    WRITE_REPO,
    WRITE_REPO_PREFIX
} from "./constants";

export const parseAuthorities = (authorities) => {
    let userType = UserType.USER;
    const grantedAuthorities = {
        [READ_REPO]: {},
        [WRITE_REPO]: {},
        [GRAPHQL]: {}
    };
    const repositories = {};
    const customRoles = [];
    for (let i = 0; i < authorities.length; i++) {
        const role = authorities[i];
        if (role === UserRole.ROLE_ADMIN) {
            userType = UserType.ADMIN;
        } else if (role === UserRole.ROLE_REPO_MANAGER) {
            if (userType !== UserType.ADMIN) {
                userType = UserType.REPO_MANAGER;
            }
        } else if (role === UserRole.ROLE_USER) {
            userType = UserType.USER;
        } else if (role.indexOf(READ_REPO_PREFIX) === 0 || role.indexOf(WRITE_REPO_PREFIX) === 0 || role.indexOf(GRAPHQL_PREFIX) === 0) {
            const repoData = getRepoFromAuthority(role);
            if (repoData) {
                const { prefix, repo } = repoData;
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
        customRoles: customRoles
    };
};

export const createUniqueKey = function (repository) {
    if (repository.location) {
        return `${repository.id}@${repository.location}`;
    }
    return repository.id;
};


/**
 * Given an authority string, returns an object with the prefix used and the repository id.
 * Returns null if the authority does not start with a known repo prefix.
 */
export const getRepoFromAuthority = (role) => {
    if (role.startsWith(READ_REPO_PREFIX)) {
        return { prefix: READ_REPO_PREFIX, repo: role.substring(READ_REPO_PREFIX.length) };
    }
    if (role.startsWith(WRITE_REPO_PREFIX)) {
        return { prefix: WRITE_REPO_PREFIX, repo: role.substring(WRITE_REPO_PREFIX.length) };
    }
    if (role.startsWith(GRAPHQL_PREFIX)) {
        return { prefix: GRAPHQL_PREFIX, repo: role.substring(GRAPHQL_PREFIX.length) };
    }
    return null;
};
