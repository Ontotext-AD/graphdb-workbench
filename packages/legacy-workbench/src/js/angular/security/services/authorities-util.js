import {UserRole, UserType, UserUtils} from "../../utils/user-utils";
import {READ_REPO, WRITE_REPO} from "./constants";

export const parseAuthorities = (authorities) => {
    let userType = UserType.USER;
    const grantedAuthorities = {
        [READ_REPO]: {},
        [WRITE_REPO]: {}
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
        } else if (role.indexOf('READ_REPO_') === 0 || role.indexOf('WRITE_REPO_') === 0) {
            const index = role.indexOf('_', role.indexOf('_') + 1);
            const op = role.substr(0, index);
            const repo = role.substr(index + 1);
            grantedAuthorities[op][repo] = true;
            repositories[repo] = repositories[repo] || {};
            if (op === READ_REPO) {
                repositories[repo].read = true;
            } else if (op === WRITE_REPO) {
                repositories[repo].write = true;
            }
        } else if (role.indexOf('CUSTOM_') === 0) {
            customRoles.push(role.substr('CUSTOM_'.length));
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
