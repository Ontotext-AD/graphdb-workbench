import {Repository, RepositoryState, RepositoryType, ViewRestrictionCondition} from '@ontotext/workbench-api';

import {ViewRestrictionTestScenario, ViewRestrictionTestScenarioBuilder} from './view-restriction-test-scenario-builder';

const {IS_REPOSITORY_NOT_SELECTED, MISSING_WRITE_PERMISSIONS, IS_ONTOP, IS_FEDEX, IS_LICENSE_INVALID} = ViewRestrictionCondition;
const ALL_CONDITIONS = [IS_REPOSITORY_NOT_SELECTED, MISSING_WRITE_PERMISSIONS, IS_ONTOP, IS_FEDEX, IS_LICENSE_INVALID];

export const REPO_A_ID = 'repo-a';
export const REPO_B_ID = 'repo-b';
const FEDX_REPO_ID = 'fedx-repo';
const ONTOP_REPO_ID = 'ontop-repo';
export const REMOTE_REPO_ID = 'remote-repo';

const REPO_A = new Repository({id: REPO_A_ID, title: REPO_A_ID, type: RepositoryType.GRAPH_DB, sesameType: 'graphdb:SailRepository', state: RepositoryState.RUNNING});
const REPO_B = new Repository({id: REPO_B_ID, title: REPO_B_ID, type: RepositoryType.GRAPH_DB, sesameType: 'graphdb:SailRepository', state: RepositoryState.INACTIVE});
const FEDX_REPO = new Repository({id: FEDX_REPO_ID, title: FEDX_REPO_ID, type: RepositoryType.FEDX, sesameType: 'graphdb:FedXRepository', state: RepositoryState.STARTING});
const ONTOP_REPO = new Repository({id: ONTOP_REPO_ID, title: ONTOP_REPO_ID, type: RepositoryType.ONTOP, sesameType: 'graphdb:OntopRepository', state: RepositoryState.RUNNING});
const REMOTE_REPO = new Repository({
  id: REMOTE_REPO_ID,
  title: REMOTE_REPO_ID,
  type: RepositoryType.GRAPH_DB,
  sesameType: 'graphdb:SailRepository',
  state: RepositoryState.RUNNING,
  location: 'https://remote-host:7200'
});
const REPOSITORIES = [REPO_A, REPO_B, FEDX_REPO, ONTOP_REPO];
export const ALL_LOCAL_REPOSITORY_IDS = [FEDX_REPO_ID, ONTOP_REPO_ID, REPO_A_ID, REPO_B_ID];

/**
 * The users from the test data, with their authorities defined in `USERS`.
 */
export type TestUser = 'admin' | 'reader' | 'mixed' | 'maintainer';

/**
 * The users from the test data. Without a user, security is OFF.
 */
export const USERS: Record<TestUser, string[]> = {
  admin: ['ROLE_ADMIN', 'ROLE_REPO_MANAGER', 'ROLE_USER'],
  reader: ['ROLE_USER', 'READ_REPO_*'],
  mixed: ['ROLE_USER', 'READ_REPO_*', `WRITE_REPO_${REPO_A_ID}`],
  maintainer: ['ROLE_USER', 'READ_REPO_*', `WRITE_REPO_${REPO_A_ID}`, `MAINTAIN_REPO_${REPO_A_ID}`],
};

/**
 * Fetches all defined page restriction scenarios.
 */
export function getScenarios(): ViewRestrictionTestScenario[] {
  return [
    getNoRepositorySelectedWithCreateRightsScenario(),
    getNoRepositorySelectedWithoutCreateRightsScenario(),
    getNoRepositorySelectedWithUndeclaredInvalidLicenseScenario(),
    getAllRestrictionsDeclaredNoneAppliesScenario(),
    getSeveralRestrictionsApplyScenario(),
    getInvalidLicenseWithSecurityOffAndNoRepositorySelectedScenario(),
    getFedxRepositorySelectedWithCreateRightsScenario(),
    getOntopRepositorySelectedWithWriteRightsScenario(),
    getOntopRepositorySelectedWithoutWriteRightsScenario(),
    getWriteRequiredOnOntopRepositoryWithOneWritableRepositoryScenario(),
    getWriteRequiredWithoutWritableRepositoriesScenario(),
    getWriteRequiredWithoutWritableRepositoriesAndNoRepositorySelectedScenario(),
    getNoRepositoryOfAllowedTypeWithCreateRightsScenario(),
    getFedxRepositorySelectedWithoutCreateRightsScenario(),
    getWriteRequiredWithSecurityOffScenario(),
    getNoRepositorySelectedWithRemoteLocationScenario(),
    getNoRepositoriesWithCreateRightsScenario(),
    getSelectedRepositoryOfNotAllowedTypeScenario(),
    getInvalidLicenseWithRepositorySelectedScenario(),
    getNoRepositorySelectedWithOneWritableRepositoryScenario(),
    getOnlyWriteRequiredWithoutWritableRepositoriesScenario(),
    getNoRestrictionsDeclaredScenario(),
    getNoRepositorySelectedForRepositoryMaintainerScenario(),
    getMissingLicenseWithRepositorySelectedScenario(),
    getOntopRepositorySelectedWithoutRequiredSelectionScenario(),
    getFedxRepositorySelectedWithoutRequiredSelectionScenario(),
  ];
}

/**
 * No repository selected, the user can create one.
 *
 * **Given**: an admin with a valid license opens a page that requires a selected repository, and no repository is selected.
 *
 * **Expected**: the page content is hidden and the user is asked to select or create a repository. The picker offers all
 * local repositories and the create repository button is shown.
 */
export function getNoRepositorySelectedWithCreateRightsScenario(): ViewRestrictionTestScenario {
  return new ViewRestrictionTestScenarioBuilder()
    .withRestrictions([IS_REPOSITORY_NOT_SELECTED])
    .withValidLicense()
    .withUser('admin')
    .withRepositories(REPOSITORIES)
    .withExpectedContentHidden()
    .withExpectedMessages([{key: 'no_active_repository_select_or_create_one'}])
    .withExpectedPicker(ALL_LOCAL_REPOSITORY_IDS)
    .withExpectedCreateButtonShown()
    .build();
}

/**
 * No repository selected, the user can't create one.
 *
 * **Given**: a user with read-only rights and a valid license opens a page that requires a selected repository, and no
 * repository is selected.
 *
 * **Expected**: the page content is hidden and the user is asked to select a repository. The picker offers all local
 * repositories, but the create repository button is not shown.
 */
export function getNoRepositorySelectedWithoutCreateRightsScenario(): ViewRestrictionTestScenario {
  return new ViewRestrictionTestScenarioBuilder()
    .withRestrictions([IS_REPOSITORY_NOT_SELECTED])
    .withValidLicense()
    .withUser('reader')
    .withRepositories(REPOSITORIES)
    .withExpectedContentHidden()
    .withExpectedMessages([{key: 'no_active_repository_select_one'}])
    .withExpectedPicker(ALL_LOCAL_REPOSITORY_IDS)
    .withExpectedCreateButtonHidden()
    .build();
}

/**
 * Invalid license, no repository selected, the page doesn't declare the license restriction.
 *
 * **Given**: an admin with an invalid license opens a page that requires a selected repository, but doesn't declare the
 * license restriction, and no repository is selected.
 *
 * **Expected**: the page content is hidden and the user is asked to select a repository, without an invalid license
 * message. The picker offers all local repositories, but the create repository button is not shown, because a
 * repository can't be created with an invalid license.
 */
export function getNoRepositorySelectedWithUndeclaredInvalidLicenseScenario(): ViewRestrictionTestScenario {
  return new ViewRestrictionTestScenarioBuilder()
    .withRestrictions([IS_REPOSITORY_NOT_SELECTED])
    .withInvalidLicense()
    .withUser('admin')
    .withRepositories(REPOSITORIES)
    .withExpectedContentHidden()
    .withExpectedMessages([{key: 'no_active_repository_select_one'}])
    .withExpectedPicker(ALL_LOCAL_REPOSITORY_IDS)
    .withExpectedCreateButtonHidden()
    .build();
}

/**
 * All restrictions declared, none applies.
 *
 * **Given**: an admin with a valid license opens a page that declares all restrictions and works only with GraphDB
 * repositories, and a GraphDB repository is selected.
 *
 * **Expected**: the page content is shown, without restriction messages, picker or create repository button.
 */
export function getAllRestrictionsDeclaredNoneAppliesScenario(): ViewRestrictionTestScenario {
  return new ViewRestrictionTestScenarioBuilder()
    .withRestrictions(ALL_CONDITIONS)
    .withAllowedRepositoryTypes([RepositoryType.GRAPH_DB])
    .withValidLicense()
    .withUser('admin')
    .withRepositories(REPOSITORIES)
    .withSelectedRepository(REPO_A)
    .withExpectedContentShown()
    .withExpectedPickerHidden()
    .withExpectedCreateButtonHidden()
    .build();
}

/**
 * Several restrictions apply at once.
 *
 * **Given**: a user with read-only rights and an invalid license opens a page that declares all restrictions and works
 * only with GraphDB repositories, and a GraphDB repository is selected.
 *
 * **Expected**: the page content is hidden and three messages are shown, in order: the license is invalid (with a link
 * to set a new license), there are no writable repositories, and the user can't write to the selected repository.
 * The picker is empty and the create repository button is not shown.
 */
export function getSeveralRestrictionsApplyScenario(): ViewRestrictionTestScenario {
  return new ViewRestrictionTestScenarioBuilder()
    .withRestrictions(ALL_CONDITIONS)
    .withAllowedRepositoryTypes([RepositoryType.GRAPH_DB])
    .withInvalidLicense()
    .withUser('reader')
    .withRepositories(REPOSITORIES)
    .withSelectedRepository(REPO_A)
    .withExpectedContentHidden()
    .withExpectedMessages([
      {key: 'invalid_license', hasLicenseLink: true},
      {key: 'no_accessible_writable_repos'},
      {key: 'no_write_permission', params: {repositoryId: REPO_A_ID}},
    ])
    .withExpectedPicker([])
    .withExpectedCreateButtonHidden()
    .build();
}

/**
 * Invalid license, security OFF, no repository selected.
 *
 * **Given**: security is OFF and the license is invalid. A page that requires a selected repository and declares the
 * license restriction is opened, and no repository is selected.
 *
 * **Expected**: the page content is hidden and two messages are shown, in order: the license is invalid (with a link to
 * set a new license), and the user is asked to select a repository. The picker offers all local repositories, but the
 * create repository button is not shown.
 */
export function getInvalidLicenseWithSecurityOffAndNoRepositorySelectedScenario(): ViewRestrictionTestScenario {
  return new ViewRestrictionTestScenarioBuilder()
    .withRestrictions([IS_REPOSITORY_NOT_SELECTED, IS_LICENSE_INVALID])
    .withInvalidLicense()
    .withSecurityOff()
    .withRepositories(REPOSITORIES)
    .withExpectedContentHidden()
    .withExpectedMessages([
      {key: 'invalid_license', hasLicenseLink: true},
      {key: 'no_active_repository_select_one'},
    ])
    .withExpectedPicker(ALL_LOCAL_REPOSITORY_IDS)
    .withExpectedCreateButtonHidden()
    .build();
}

/**
 * FedX repository selected.
 *
 * **Given**: an admin with a valid license opens a page that doesn't support Ontop and FedX repositories and works only
 * with GraphDB repositories, and a FedX repository is selected.
 *
 * **Expected**: the page content is hidden and a message says that the page doesn't support FedX repositories. The picker
 * offers only the GraphDB repositories and the create repository button is shown.
 */
export function getFedxRepositorySelectedWithCreateRightsScenario(): ViewRestrictionTestScenario {
  return new ViewRestrictionTestScenarioBuilder()
    .withRestrictions([IS_REPOSITORY_NOT_SELECTED, IS_ONTOP, IS_FEDEX])
    .withAllowedRepositoryTypes([RepositoryType.GRAPH_DB])
    .withValidLicense()
    .withUser('admin')
    .withRepositories(REPOSITORIES)
    .withSelectedRepository(FEDX_REPO)
    .withExpectedContentHidden()
    .withExpectedMessages([{key: 'fedx_unsupported', params: {pageTitle: 'Graph Navigator'}}])
    .withExpectedPicker([REPO_A_ID, REPO_B_ID])
    .withExpectedCreateButtonShown()
    .build();
}

/**
 * Ontop repository selected, the user has write rights.
 *
 * **Given**: an admin with a valid license opens a page that doesn't support Ontop repositories and works with GraphDB and
 * FedX repositories, and an Ontop repository is selected.
 *
 * **Expected**: the page content is hidden and a message says that the selected Ontop repository is read-only. The picker
 * offers the GraphDB and FedX repositories and the create repository button is shown.
 */
export function getOntopRepositorySelectedWithWriteRightsScenario(): ViewRestrictionTestScenario {
  return new ViewRestrictionTestScenarioBuilder()
    .withRestrictions([IS_REPOSITORY_NOT_SELECTED, IS_ONTOP])
    .withAllowedRepositoryTypes([RepositoryType.GRAPH_DB, RepositoryType.FEDX])
    .withValidLicense()
    .withUser('admin')
    .withRepositories(REPOSITORIES)
    .withSelectedRepository(ONTOP_REPO)
    .withExpectedContentHidden()
    .withExpectedMessages([{key: 'read_only_ontop', params: {repositoryId: ONTOP_REPO_ID}}])
    .withExpectedPicker([FEDX_REPO_ID, REPO_A_ID, REPO_B_ID])
    .withExpectedCreateButtonShown()
    .build();
}

/**
 * Ontop repository selected, the user has no write rights.
 *
 * **Given**: a user with read-only rights and a valid license opens a page that doesn't support Ontop repositories and
 * works with GraphDB and FedX repositories, and an Ontop repository is selected.
 *
 * **Expected**: the page content is hidden and a message says that the selected Ontop repository is read-only. The picker
 * offers the GraphDB and FedX repositories, but the create repository button is not shown.
 */
export function getOntopRepositorySelectedWithoutWriteRightsScenario(): ViewRestrictionTestScenario {
  return new ViewRestrictionTestScenarioBuilder()
    .withRestrictions([IS_REPOSITORY_NOT_SELECTED, IS_ONTOP])
    .withAllowedRepositoryTypes([RepositoryType.GRAPH_DB, RepositoryType.FEDX])
    .withValidLicense()
    .withUser('reader')
    .withRepositories(REPOSITORIES)
    .withSelectedRepository(ONTOP_REPO)
    .withExpectedContentHidden()
    .withExpectedMessages([{key: 'read_only_ontop', params: {repositoryId: ONTOP_REPO_ID}}])
    .withExpectedPicker([FEDX_REPO_ID, REPO_A_ID, REPO_B_ID])
    .withExpectedCreateButtonHidden()
    .build();
}

/**
 * Missing write permission on an Ontop repository.
 *
 * **Given**: a user who can write only to `repo-a`, with a valid license, opens a page that requires write access, doesn't
 * support Ontop repositories and works with GraphDB and FedX repositories, and an Ontop repository is selected.
 *
 * **Expected**: the page content is hidden and only the message that the user can't write to the selected repository is
 * shown. The picker offers only `repo-a`, the one writable repository, and the create repository button is not shown.
 */
export function getWriteRequiredOnOntopRepositoryWithOneWritableRepositoryScenario(): ViewRestrictionTestScenario {
  return new ViewRestrictionTestScenarioBuilder()
    .withRestrictions([IS_REPOSITORY_NOT_SELECTED, MISSING_WRITE_PERMISSIONS, IS_ONTOP])
    .withAllowedRepositoryTypes([RepositoryType.GRAPH_DB, RepositoryType.FEDX])
    .withValidLicense()
    .withUser('mixed')
    .withRepositories(REPOSITORIES)
    .withSelectedRepository(ONTOP_REPO)
    .withExpectedContentHidden()
    .withExpectedMessages([{key: 'no_write_permission', params: {repositoryId: ONTOP_REPO_ID}}])
    .withExpectedPicker([REPO_A_ID])
    .withExpectedCreateButtonHidden()
    .build();
}

/**
 * Missing write permission, no writable repositories.
 *
 * **Given**: a user with read-only rights and a valid license opens a page that requires write access, and a GraphDB
 * repository is selected.
 *
 * **Expected**: the page content is hidden and two messages are shown, in order: there are no writable repositories, and
 * the user can't write to the selected repository. The picker is empty and the create repository button is not shown.
 */
export function getWriteRequiredWithoutWritableRepositoriesScenario(): ViewRestrictionTestScenario {
  return new ViewRestrictionTestScenarioBuilder()
    .withRestrictions([IS_REPOSITORY_NOT_SELECTED, MISSING_WRITE_PERMISSIONS, IS_ONTOP])
    .withAllowedRepositoryTypes([RepositoryType.GRAPH_DB, RepositoryType.FEDX])
    .withValidLicense()
    .withUser('reader')
    .withRepositories(REPOSITORIES)
    .withSelectedRepository(REPO_A)
    .withExpectedContentHidden()
    .withExpectedMessages([
      {key: 'no_accessible_writable_repos'},
      {key: 'no_write_permission', params: {repositoryId: REPO_A_ID}},
    ])
    .withExpectedPicker([])
    .withExpectedCreateButtonHidden()
    .build();
}

/**
 * No repository selected, no writable repositories.
 *
 * **Given**: a user with read-only rights and a valid license opens a page that requires write access, and no repository
 * is selected.
 *
 * **Expected**: the page content is hidden and only the message that there are no writable repositories is shown. The
 * picker is empty and the create repository button is not shown.
 */
export function getWriteRequiredWithoutWritableRepositoriesAndNoRepositorySelectedScenario(): ViewRestrictionTestScenario {
  return new ViewRestrictionTestScenarioBuilder()
    .withRestrictions([IS_REPOSITORY_NOT_SELECTED, MISSING_WRITE_PERMISSIONS, IS_ONTOP])
    .withAllowedRepositoryTypes([RepositoryType.GRAPH_DB, RepositoryType.FEDX])
    .withValidLicense()
    .withUser('reader')
    .withRepositories(REPOSITORIES)
    .withExpectedContentHidden()
    .withExpectedMessages([{key: 'no_accessible_writable_repos'}])
    .withExpectedPicker([])
    .withExpectedCreateButtonHidden()
    .build();
}

/**
 * No accessible repositories, the user can create one.
 *
 * **Given**: an admin with a valid license opens a page that requires a selected repository and works only with
 * repositories of a type that none of the existing repositories has, and no repository is selected.
 *
 * **Expected**: the page content is hidden and a message says that there are no accessible repositories and offers to
 * create one. The picker is empty and the create repository button is shown.
 */
export function getNoRepositoryOfAllowedTypeWithCreateRightsScenario(): ViewRestrictionTestScenario {
  return new ViewRestrictionTestScenarioBuilder()
    .withRestrictions([IS_REPOSITORY_NOT_SELECTED])
    .withAllowedRepositoryTypes([RepositoryType.OTHER])
    .withValidLicense()
    .withUser('admin')
    .withRepositories(REPOSITORIES)
    .withExpectedContentHidden()
    .withExpectedMessages([{key: 'no_accessible_repos_create_one'}])
    .withExpectedPicker([])
    .withExpectedCreateButtonShown()
    .build();
}

/**
 * FedX repository selected, the user has no write rights, the page doesn't require write access.
 *
 * **Given**: a user with read-only rights and a valid license opens a page that doesn't support Ontop and FedX repositories
 * and works only with GraphDB repositories, and a FedX repository is selected.
 *
 * **Expected**: the page content is hidden and a message says that the page doesn't support FedX repositories. The picker
 * offers only the GraphDB repositories, but the create repository button is not shown.
 */
export function getFedxRepositorySelectedWithoutCreateRightsScenario(): ViewRestrictionTestScenario {
  return new ViewRestrictionTestScenarioBuilder()
    .withRestrictions([IS_REPOSITORY_NOT_SELECTED, IS_ONTOP, IS_FEDEX])
    .withAllowedRepositoryTypes([RepositoryType.GRAPH_DB])
    .withValidLicense()
    .withUser('reader')
    .withRepositories(REPOSITORIES)
    .withSelectedRepository(FEDX_REPO)
    .withExpectedContentHidden()
    .withExpectedMessages([{key: 'fedx_unsupported', params: {pageTitle: 'Graph Navigator'}}])
    .withExpectedPicker([REPO_A_ID, REPO_B_ID])
    .withExpectedCreateButtonHidden()
    .build();
}

/**
 * A page that requires write access, security OFF.
 *
 * **Given**: security is OFF and the license is valid. A page that requires write access is opened, and a GraphDB
 * repository is selected.
 *
 * **Expected**: the page content is shown, because with security OFF everyone can write. No restriction messages, picker
 * or create repository button are shown.
 */
export function getWriteRequiredWithSecurityOffScenario(): ViewRestrictionTestScenario {
  return new ViewRestrictionTestScenarioBuilder()
    .withRestrictions([IS_REPOSITORY_NOT_SELECTED, MISSING_WRITE_PERMISSIONS, IS_ONTOP])
    .withAllowedRepositoryTypes([RepositoryType.GRAPH_DB, RepositoryType.FEDX])
    .withValidLicense()
    .withSecurityOff()
    .withRepositories(REPOSITORIES)
    .withSelectedRepository(REPO_A)
    .withExpectedContentShown()
    .withExpectedPickerHidden()
    .withExpectedCreateButtonHidden()
    .build();
}

/**
 * No repository selected, a remote location is attached.
 *
 * **Given**: an admin with a valid license opens a page that requires a selected repository, a remote location with its own
 * repository is attached, and no repository is selected.
 *
 * **Expected**: the page content is hidden and the user is asked to select or create a repository. The picker offers only
 * the local repositories, not the remote one, and the create repository button is shown.
 */
export function getNoRepositorySelectedWithRemoteLocationScenario(): ViewRestrictionTestScenario {
  return new ViewRestrictionTestScenarioBuilder()
    .withRestrictions([IS_REPOSITORY_NOT_SELECTED])
    .withValidLicense()
    .withUser('admin')
    .withRepositories([...REPOSITORIES, REMOTE_REPO])
    .withExpectedContentHidden()
    .withExpectedMessages([{key: 'no_active_repository_select_or_create_one'}])
    .withExpectedPicker(ALL_LOCAL_REPOSITORY_IDS)
    .withExpectedCreateButtonShown()
    .build();
}

/**
 * No repositories at all, the user can create one.
 *
 * **Given**: an admin with a valid license opens a page that requires a selected repository, and there are no repositories.
 *
 * **Expected**: the page content is hidden and a message says that there are no accessible repositories and offers to
 * create one. The picker is empty and the create repository button is shown.
 */
export function getNoRepositoriesWithCreateRightsScenario(): ViewRestrictionTestScenario {
  return new ViewRestrictionTestScenarioBuilder()
    .withRestrictions([IS_REPOSITORY_NOT_SELECTED])
    .withValidLicense()
    .withUser('admin')
    .withRepositories([])
    .withExpectedContentHidden()
    .withExpectedMessages([{key: 'no_accessible_repos_create_one'}])
    .withExpectedPicker([])
    .withExpectedCreateButtonShown()
    .build();
}

/**
 * The selected repository is excluded only by the allowed repository types.
 *
 * **Given**: an admin with a valid license opens a page that declares no restriction conditions, but works only with Ontop
 * repositories, and a GraphDB repository is selected.
 *
 * **Expected**: the page content is hidden and the user is asked to select or create a repository, as the selected one is
 * not allowed. The picker offers only the Ontop repository and the create repository button is shown.
 */
export function getSelectedRepositoryOfNotAllowedTypeScenario(): ViewRestrictionTestScenario {
  return new ViewRestrictionTestScenarioBuilder()
    .withRestrictions([])
    .withAllowedRepositoryTypes([RepositoryType.ONTOP])
    .withValidLicense()
    .withUser('admin')
    .withRepositories(REPOSITORIES)
    .withSelectedRepository(REPO_A)
    .withExpectedContentHidden()
    .withExpectedMessages([{key: 'no_active_repository_select_or_create_one'}])
    .withExpectedPicker([ONTOP_REPO_ID])
    .withExpectedCreateButtonShown()
    .build();
}

/**
 * Invalid license, a repository is selected.
 *
 * **Given**: security is OFF and the license is invalid. A page that declares only the license restriction is opened, and
 * a GraphDB repository is selected.
 *
 * **Expected**: the page content is hidden and only the invalid license message is shown (with a link to set a new
 * license). The picker is not shown, as selecting another repository doesn't help.
 */
export function getInvalidLicenseWithRepositorySelectedScenario(): ViewRestrictionTestScenario {
  return new ViewRestrictionTestScenarioBuilder()
    .withRestrictions([IS_LICENSE_INVALID])
    .withInvalidLicense()
    .withSecurityOff()
    .withRepositories(REPOSITORIES)
    .withSelectedRepository(REPO_A)
    .withExpectedContentHidden()
    .withExpectedMessages([{key: 'invalid_license', hasLicenseLink: true}])
    .withExpectedPickerHidden()
    .withExpectedCreateButtonHidden()
    .build();
}

/**
 * No repository selected, the user can write to some repositories.
 *
 * **Given**: a user who can write only to `repo-a`, with a valid license, opens a page that requires a selected repository
 * and write access, and no repository is selected.
 *
 * **Expected**: the page content is hidden and the user is asked to select a repository. The picker offers only `repo-a`,
 * the one writable repository, and the create repository button is not shown.
 */
export function getNoRepositorySelectedWithOneWritableRepositoryScenario(): ViewRestrictionTestScenario {
  return new ViewRestrictionTestScenarioBuilder()
    .withRestrictions([IS_REPOSITORY_NOT_SELECTED, MISSING_WRITE_PERMISSIONS])
    .withValidLicense()
    .withUser('mixed')
    .withRepositories(REPOSITORIES)
    .withExpectedContentHidden()
    .withExpectedMessages([{key: 'no_active_repository_select_one'}])
    .withExpectedPicker([REPO_A_ID])
    .withExpectedCreateButtonHidden()
    .build();
}

/**
 * Write access required without a required selected repository, no writable repositories.
 *
 * **Given**: a user with read-only rights and a valid license opens a page that requires write access, but doesn't
 * require a selected repository, and a GraphDB repository is selected.
 *
 * **Expected**: the page content is hidden and two messages are shown, in order: there are no writable repositories, and
 * the user can't write to the selected repository. The picker is empty and the create repository button is not shown.
 */
export function getOnlyWriteRequiredWithoutWritableRepositoriesScenario(): ViewRestrictionTestScenario {
  return new ViewRestrictionTestScenarioBuilder()
    .withRestrictions([MISSING_WRITE_PERMISSIONS])
    .withValidLicense()
    .withUser('reader')
    .withRepositories(REPOSITORIES)
    .withSelectedRepository(REPO_A)
    .withExpectedContentHidden()
    .withExpectedMessages([
      {key: 'no_accessible_writable_repos'},
      {key: 'no_write_permission', params: {repositoryId: REPO_A_ID}},
    ])
    .withExpectedPicker([])
    .withExpectedCreateButtonHidden()
    .build();
}

/**
 * No restrictions declared, all of them would apply.
 *
 * **Given**: a user with read-only rights and an invalid license opens a page that declares no restrictions, and a FedX
 * repository is selected.
 *
 * **Expected**: the page content is shown, because a condition that the page doesn't declare never restricts it. No
 * restriction messages, picker or create repository button are shown.
 */
export function getNoRestrictionsDeclaredScenario(): ViewRestrictionTestScenario {
  return new ViewRestrictionTestScenarioBuilder()
    .withRestrictions([])
    .withInvalidLicense()
    .withUser('reader')
    .withRepositories(REPOSITORIES)
    .withSelectedRepository(FEDX_REPO)
    .withExpectedContentShown()
    .withExpectedPickerHidden()
    .withExpectedCreateButtonHidden()
    .build();
}

/**
 * No repository selected, the user maintains a repository, but can't manage repositories.
 *
 * **Given**: a user who can read all repositories, and write to and maintain `repo-a`, with a valid license, opens a page
 * that requires a selected repository, and no repository is selected.
 *
 * **Expected**: the page content is hidden and the user is asked to select a repository. The picker offers all local
 * repositories, but the create repository button is not shown, because maintaining a repository doesn't allow creating
 * repositories.
 */
export function getNoRepositorySelectedForRepositoryMaintainerScenario(): ViewRestrictionTestScenario {
  return new ViewRestrictionTestScenarioBuilder()
    .withRestrictions([IS_REPOSITORY_NOT_SELECTED])
    .withValidLicense()
    .withUser('maintainer')
    .withRepositories(REPOSITORIES)
    .withExpectedContentHidden()
    .withExpectedMessages([{key: 'no_active_repository_select_one'}])
    .withExpectedPicker(ALL_LOCAL_REPOSITORY_IDS)
    .withExpectedCreateButtonHidden()
    .build();
}

/**
 * No license loaded, a repository is selected.
 *
 * **Given**: an admin opens a page that declares the license restriction, no license is loaded, and a GraphDB repository
 * is selected.
 *
 * **Expected**: the page content is hidden and only the invalid license message is shown (with a link to set a new
 * license), as a missing license is treated as an invalid one. The picker is not shown.
 */
export function getMissingLicenseWithRepositorySelectedScenario(): ViewRestrictionTestScenario {
  return new ViewRestrictionTestScenarioBuilder()
    .withRestrictions([IS_LICENSE_INVALID])
    .withMissingLicense()
    .withUser('admin')
    .withRepositories(REPOSITORIES)
    .withSelectedRepository(REPO_A)
    .withExpectedContentHidden()
    .withExpectedMessages([{key: 'invalid_license', hasLicenseLink: true}])
    .withExpectedPickerHidden()
    .withExpectedCreateButtonHidden()
    .build();
}

/**
 * Ontop repository selected, the user has no write rights, the page doesn't require a selected repository.
 *
 * **Given**: a user with read-only rights and a valid license opens a page that declares only the Ontop and FedX
 * restrictions and allows repositories of all types, and an Ontop repository is selected.
 *
 * **Expected**: the page content is hidden and only the message that the selected Ontop repository is read-only is shown,
 * even though the user can't write to it. The picker offers all local repositories, but the create repository button is
 * not shown.
 */
export function getOntopRepositorySelectedWithoutRequiredSelectionScenario(): ViewRestrictionTestScenario {
  return new ViewRestrictionTestScenarioBuilder()
    .withRestrictions([IS_ONTOP, IS_FEDEX])
    .withValidLicense()
    .withUser('reader')
    .withRepositories(REPOSITORIES)
    .withSelectedRepository(ONTOP_REPO)
    .withExpectedContentHidden()
    .withExpectedMessages([{key: 'read_only_ontop', params: {repositoryId: ONTOP_REPO_ID}}])
    .withExpectedPicker(ALL_LOCAL_REPOSITORY_IDS)
    .withExpectedCreateButtonHidden()
    .build();
}

/**
 * FedX repository selected, the page doesn't require a selected repository.
 *
 * **Given**: security is OFF and the license is valid. A page that declares only the Ontop and FedX restrictions and
 * allows repositories of all types is opened, and a FedX repository is selected.
 *
 * **Expected**: the page content is hidden and only the message that the page doesn't support FedX repositories is shown.
 * The picker offers all local repositories and the create repository button is shown.
 */
export function getFedxRepositorySelectedWithoutRequiredSelectionScenario(): ViewRestrictionTestScenario {
  return new ViewRestrictionTestScenarioBuilder()
    .withRestrictions([IS_ONTOP, IS_FEDEX])
    .withValidLicense()
    .withSecurityOff()
    .withRepositories(REPOSITORIES)
    .withSelectedRepository(FEDX_REPO)
    .withExpectedContentHidden()
    .withExpectedMessages([{key: 'fedx_unsupported', params: {pageTitle: 'Graph Navigator'}}])
    .withExpectedPicker(ALL_LOCAL_REPOSITORY_IDS)
    .withExpectedCreateButtonShown()
    .build();
}
