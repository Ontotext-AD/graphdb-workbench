import {mapObject} from "../../utils/map-object";
import {UserModel} from "../../models/security/security";
import {
    GRAPHQL_PREFIX,
    GRAPHQL_SUFFIX,
    GRAPHQL_SUFFIX_WITH_DELIMITER,
    READ_REPO_PREFIX,
    SUFFIX_DELIMITER,
    WRITE_REPO_PREFIX
} from "./constants";
import {getRepoFromAuthority} from "./authorities-util";

export const toUserModelMapper = (data, key = 'grantedAuthorities') => {
    if (Array.isArray(data)) {
        return data.map((user) => toUserModelMapper(user));
    }
    const mappedData = mapObject(
        data,
        {
            [key]: {
                transform: mapAuthoritiesFromBackend,
                newKey: 'grantedAuthoritiesUiModel'
            }
        },
        {
            removeOldKey: false
        }
    );
    return new UserModel(mappedData);
};

export const fromUserModelMapper = (uiModel, key = 'grantedAuthorities') => {
    if (Array.isArray(uiModel)) {
        return uiModel.map((model) => fromUserModelMapper(model));
    }
    return mapObject(uiModel,  {
            [key]: mapAuthoritiesToBackend
    });
};

// Transformation function for BE-to-UI conversion.
const mapAuthoritiesFromBackend = (authorities) => {
    const result = [];
    for (const auth of authorities) {
        if (auth.includes(SUFFIX_DELIMITER)) {
            // For example: "READ_REPO_ABC:GRAPHQL" or "WRITE_REPO_ABC:GRAPHQL"
            const [oldAuth, suffix] = auth.split(SUFFIX_DELIMITER);
            const hasRepoRights = oldAuth.indexOf(READ_REPO_PREFIX) === 0 || oldAuth.indexOf(WRITE_REPO_PREFIX) === 0;
            if (hasRepoRights && suffix === GRAPHQL_SUFFIX) {
                // Use the helper to extract the repository id.
                const repoData = getRepoFromAuthority(oldAuth);
                if (repoData) {
                    const { repo } = repoData;
                    const uiAuth = GRAPHQL_PREFIX + repo;
                    if (!result.includes(oldAuth)) {
                        result.push(oldAuth);
                    }
                    if (!result.includes(uiAuth)) {
                        result.push(uiAuth);
                    }
                    continue;
                }
            }
        }
        if (!result.includes(auth)) {
            result.push(auth);
        }
    }
    return result;
};

// Transformation function for UI-to-BE conversion.
const mapAuthoritiesToBackend = (uiAuthorities) => {
    if (!Array.isArray(uiAuthorities)) {
        return uiAuthorities;
    }

    const customAuthorities = [];
    const repoMap = {};
    // Helper to ensure a fresh entry for each repository.
    const getOrCreateRepo = (repoId) => {
        if (!repoMap[repoId]) {
            repoMap[repoId] = { read: false, write: false, graphql: false };
        }
        return repoMap[repoId];
    };

    let isReadAll = false;
    let isWriteAll = false;
    let isGraphqlAll = false;
    uiAuthorities.forEach((auth) => {
        const repoData = getRepoFromAuthority(auth);
        if (repoData) {
            const { prefix, repo } = repoData;
            const entry = getOrCreateRepo(repo);
            if (prefix === READ_REPO_PREFIX) {
                entry.read = true;
                if(repo === '*') {
                    isReadAll = true;
                }
            } else if (prefix === WRITE_REPO_PREFIX) {
                entry.write = true;
                if(repo === '*') {
                    isWriteAll = true;
                }
            } else if (prefix === GRAPHQL_PREFIX) {
                entry.graphql = true;
                if(repo === '*') {
                    isGraphqlAll = true;
                }
            }
        } else {
            customAuthorities.push(auth);
        }
    });

    const backendAuthorities = [];
    Object.keys(repoMap).forEach((repoId) => {
        const perms = repoMap[repoId];
        if (perms.graphql || isGraphqlAll) {
            if (perms.write || isWriteAll) {
                backendAuthorities.push(`${WRITE_REPO_PREFIX}${repoId}${GRAPHQL_SUFFIX_WITH_DELIMITER}`);
                backendAuthorities.push(`${READ_REPO_PREFIX}${repoId}${GRAPHQL_SUFFIX_WITH_DELIMITER}`);
            } else if (perms.read || isReadAll) {
                backendAuthorities.push(`${READ_REPO_PREFIX}${repoId}${GRAPHQL_SUFFIX_WITH_DELIMITER}`);
            }
        } else {
            if (perms.write) {
                backendAuthorities.push(`${WRITE_REPO_PREFIX}${repoId}`);
                backendAuthorities.push(`${READ_REPO_PREFIX}${repoId}`);
            } else if (perms.read) {
                backendAuthorities.push(`${READ_REPO_PREFIX}${repoId}`);
            }
        }
    });

    return [...customAuthorities, ...backendAuthorities];
};
