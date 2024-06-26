export class UpdateUserPayload {
    constructor(data) {
        this._username = data.username;
        this._password = data.password;
        this._appSettings = data.appSettings;
    }

    get username() {
        return this._username;
    }

    set username(value) {
        this._username = value;
    }

    get password() {
        return this._password;
    }

    set password(value) {
        this._password = value;
    }

    get appSettings() {
        return this._appSettings;
    }

    set appSettings(value) {
        this._appSettings = value;
    }
}

/**
 * @typedef {Object} AppSettings
 * @property {boolean} [DEFAULT_SAMEAS]
 * @property {boolean} [COOKIE_CONSENT]
 * @property {boolean} [DEFAULT_INFERENCE]
 * @property {boolean} [EXECUTE_COUNT]
 * @property {boolean} [IGNORE_SHARED_QUERIES]
 * @property {boolean} [DEFAULT_VIS_GRAPH_SCHEMA]
 */

/**
 * @typedef {Object} RepoPermissions
 * @property {boolean} [read]
 *   Indicates whether the repository has read rights.
 * @property {boolean} [write]
 *   Indicates whether the repository has write rights.
 * @property {boolean} [graphql]
 *   Indicates whether the repository has GraphQL rights.
 */

/**
 * A map of repository IDs to an object of boolean permissions.
 *
 * Example:
 * {
 *   "foo": {
 *     "read": true,
 *     "write": true,
 *     "graphql": true
 *   },
 *   "bar": {
 *     "read": true
 *   }
 * }
 *
 * @typedef {Object.<string, RepoPermissions>} RepositoriesMap
 */

// The User UI model class
export class UserModel {
    constructor(data = {}) {
        /**
         * @type {string}
         */
        this._username = data.username;
        /**
         * @type {string}
         */
        this._password = data.password;
        /**
         * Stores user-specific application settings for default behaviors.
         *
         * @type {AppSettings}
         */
        this._appSettings = data.appSettings;
        /**
         * @type {*}
         */
        this._external = data.external;
        /**
         * Represents an array of authority strings, which may have patterns like:
         * - `READ_REPO_<repoId>`
         * - `WRITE_REPO_<repoId>`
         * - `READ_REPO_*`
         * - `WRITE_REPO_*`
         * - `READ_REPO_<repoId>:GRAPHQL`
         * - `WRITE_REPO_<repoId>:GRAPHQL`
         * - `READ_REPO_*:GRAPHQL`
         * - `WRITE_REPO_*:GRAPHQL`
         * - `CUSTOM_<something>`
         *
         * @type {string[]}
         */
        this._authorities = data.authorities;
        /**
         * Represents an array of authority strings, which may have patterns like:
         * - `READ_REPO_<repoId>`
         * - `WRITE_REPO_<repoId>`
         * - `READ_REPO_*`
         * - `WRITE_REPO_*`
         * - `READ_REPO_<repoId>:GRAPHQL`
         * - `WRITE_REPO_<repoId>:GRAPHQL`
         * - `READ_REPO_*:GRAPHQL`
         * - `WRITE_REPO_*:GRAPHQL`
         * - `CUSTOM_<something>`
         *
         * @type {string[]}
         */
        this._grantedAuthorities = data.grantedAuthorities;
        /**
         * The UI model used in the user settings view,
         * containing transformed authorities strictly for UI usage.
         *
         * Each string typically follows one of these patterns:
         * - `READ_REPO_<repoId>`
         * - `WRITE_REPO_<repoId>`
         * - `READ_REPO_*`
         * - `WRITE_REPO_*`
         * - `GRAPHQL_REPO_<repoId>`
         * - `GRAPHQL_REPO_*`
         * - `CUSTOM_<role>`
         *
         * @type {string[]}
         */
        this._grantedAuthoritiesUiModel = data.grantedAuthoritiesUiModel;
        /**
         * @type {number}
         */
        this._dateCreated = data.dateCreated;
        /**
         * @type {*[]}
         */
        this._gptThreads = data.gptThreads;
        /**
         * Stores repository permissions keyed by ID.
         * @type {RepositoriesMap}
         */
        this._repositories = data.repositories;
        /**
         * @type {string}
         */
        this._confirmpassword = data.confirmpassword;
    }

    get username() {
        return this._username;
    }

    set username(value) {
        this._username = value;
    }

    get password() {
        return this._password;
    }

    set password(value) {
        this._password = value;
    }

    get appSettings() {
        return this._appSettings;
    }

    set appSettings(value) {
        this._appSettings = value;
    }

    get external() {
        return this._external;
    }

    set external(value) {
        this._external = value;
    }

    get authorities() {
        return this._authorities;
    }

    set authorities(value) {
        this._authorities = value;
    }

    get grantedAuthorities() {
        return this._grantedAuthorities;
    }

    set grantedAuthorities(value) {
        this._grantedAuthorities = value;
    }

    get grantedAuthoritiesUiModel() {
        return this._grantedAuthoritiesUiModel;
    }

    set grantedAuthoritiesUiModel(value) {
        this._grantedAuthoritiesUiModel = value;
    }

    get dateCreated() {
        return this._dateCreated;
    }

    set dateCreated(value) {
        this._dateCreated = value;
    }

    get gptThreads() {
        return this._gptThreads;
    }

    set gptThreads(value) {
        this._gptThreads = value;
    }

    get repositories() {
        return this._repositories;
    }

    set repositories(value) {
        this._repositories = value;
    }

    get confirmpassword() {
        return this._confirmpassword;
    }

    set confirmpassword(value) {
        this._confirmpassword = value;
    }
}

