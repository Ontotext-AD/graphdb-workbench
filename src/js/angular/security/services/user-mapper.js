import {mapObject} from "../../utils/map-object";
import {UserModel} from "../../models/security/security";
import {
    GRAPHQL_PREFIX,
    GRAPHQL_SUFFIX,
    GRAPHQL_SUFFIX_WITH_DELIMITER,
    READ_REPO,
    SUFFIX_DELIMITER,
    WRITE_REPO
} from "./constants";

const REPO_AUTH_REGEX = /^(READ_REPO_|WRITE_REPO_)/;

export const toUserModelMapper = (data) => {
    if (Array.isArray(data)) {
        return data.map(user => toUserModelMapper(user));
    }
    const mappedData = mapObject(data, {
        grantedAuthorities: mapAuthoritiesFromBackend
    });
    return new UserModel(mappedData);
}

export const fromUserModelMapper = (uiModel) => {
    if (Array.isArray(uiModel)) {
        return uiModel.map(model => fromUserModelMapper(model));
    }
    return mapObject(uiModel, {
        grantedAuthorities: mapAuthoritiesToBackend
    });
}

// Transformation function for backend-to-UI conversion
const mapAuthoritiesFromBackend = (authorities) => {
    const result = [];

    for (const auth of authorities) {
        if (auth.includes(SUFFIX_DELIMITER)) {
            // For example: "READ_REPO_ABC:GRAPHQL" or "WRITE_REPO_*:GRAPHQL"
            const [oldAuth, suffix] = auth.split(':');
            if ((oldAuth === READ_REPO || oldAuth === WRITE_REPO) && suffix === GRAPHQL_SUFFIX) {
                // Remove the prefix ("READ_REPO_" or "WRITE_REPO_") to extract the repository id
                const repoId = oldAuth.replace(REPO_AUTH_REGEX, '');
                // Create the UI-specific authority (e.g., "READ_REPO_GRAPHQL_ABC")
                const uiAuth = oldAuth + GRAPHQL_PREFIX + repoId;
                if (!result.includes(oldAuth)) result.push(oldAuth);
                if (!result.includes(uiAuth)) result.push(uiAuth);
                continue;
            }
        }
        if (!result.includes(auth)) {
            result.push(auth);
        }
    }
    return result;
}

// Transformation function for UI-to-backend conversion
const mapAuthoritiesToBackend = (uiAuthorities) => {
    const authSet = new Set(uiAuthorities);
    const processed = new Set();
    const backendAuthorities = [];

    for (const auth of authSet) {
        if (REPO_AUTH_REGEX.test(auth)) {
            // Extract repository id (e.g., "ABC" or "*")
            const repoId = auth.replace(REPO_AUTH_REGEX, '');
            const uiGraphQL = GRAPHQL_PREFIX + repoId;
            if (authSet.has(uiGraphQL) && !processed.has(auth) && !processed.has(uiGraphQL)) {
                // Merge into a single backend authority, e.g., "READ_REPO_ABC:GRAPHQL"
                const combined = auth + GRAPHQL_SUFFIX_WITH_DELIMITER;
                backendAuthorities.push(combined);
                processed.add(auth);
                processed.add(uiGraphQL);
                continue;
            }
            if (!processed.has(auth)) {
                backendAuthorities.push(auth);
                processed.add(auth);
            }
        } else {
            if (!processed.has(auth)) {
                backendAuthorities.push(auth);
                processed.add(auth);
            }
        }
    }
    return backendAuthorities;
}
