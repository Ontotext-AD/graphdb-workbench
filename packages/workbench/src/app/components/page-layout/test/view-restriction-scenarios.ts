import {Repository, RepositoryType, ViewRestrictionCondition} from '@ontotext/workbench-api';

import {ViewRestrictionScenario, ViewRestrictionScenarioBuilder} from './view-restriction-scenario-builder';

const {IS_REPOSITORY_NOT_SELECTED, MISSING_WRITE_PERMISSIONS, IS_ONTOP, IS_FEDEX, IS_LICENSE_INVALID} = ViewRestrictionCondition;
const ALL_CONDITIONS = [IS_REPOSITORY_NOT_SELECTED, MISSING_WRITE_PERMISSIONS, IS_ONTOP, IS_FEDEX, IS_LICENSE_INVALID];

const REPO_A_ID = 'repo-a';
const REPO_B_ID = 'repo-b';
const FEDX_REPO_ID = 'fedx-repo';
const ONTOP_REPO_ID = 'ontop-repo';
const REMOTE_REPO_ID = 'remote-repo';

const REPO_A = new Repository({id: REPO_A_ID, title: REPO_A_ID, type: RepositoryType.GRAPH_DB, sesameType: 'graphdb:SailRepository'});
const REPO_B = new Repository({id: REPO_B_ID, title: REPO_B_ID, type: RepositoryType.GRAPH_DB, sesameType: 'graphdb:SailRepository'});
const FEDX_REPO = new Repository({id: FEDX_REPO_ID, title: FEDX_REPO_ID, type: RepositoryType.FEDX, sesameType: 'graphdb:FedXRepository'});
const ONTOP_REPO = new Repository({id: ONTOP_REPO_ID, title: ONTOP_REPO_ID, type: RepositoryType.ONTOP, sesameType: 'graphdb:OntopRepository'});
const REMOTE_REPO = new Repository({
  id: REMOTE_REPO_ID,
  title: REMOTE_REPO_ID,
  type: RepositoryType.GRAPH_DB,
  sesameType: 'graphdb:SailRepository',
  location: 'https://remote-host:7200'
});
const REPOSITORIES = [REPO_A, REPO_B, FEDX_REPO, ONTOP_REPO];
export const ALL_LOCAL_REPOSITORY_IDS = [FEDX_REPO_ID, ONTOP_REPO_ID, REPO_A_ID, REPO_B_ID];

/**
 * The users from the test data. Without a user, security is OFF.
 */
export const USERS: Record<string, string[]> = {
  admin: ['ROLE_ADMIN', 'ROLE_REPO_MANAGER', 'ROLE_USER'],
  reader: ['ROLE_USER', 'READ_REPO_*'],
  mixed: ['ROLE_USER', 'READ_REPO_*', `WRITE_REPO_${REPO_A_ID}`],
};

/**
 * Creates the new workbench scenarios from the GDB-14749 manual test scenarios.
 */
export function getScenarios(): ViewRestrictionScenario[] {
  return [
    createScenario1(),
    createScenario2(),
    createScenario3(),
    createScenario4(),
    createScenario5(),
    createScenario6(),
    createScenario7(),
    createScenario8(),
    createScenario9(),
    createScenario10(),
    createScenario11(),
    createScenario12(),
    createScenario13(),
    createScenario14(),
    createScenario15(),
    createScenario16(),
    createScenario17(),
  ];
}

/**
 * **S1**: No repository selected, the user can create one.
 *
 * **Given**: an admin with a valid license opens a page that requires a selected repository, and no repository is selected.
 *
 * **Expected**: the page content is hidden and the user is asked to select or create a repository. The picker offers all
 * local repositories and the create repository button is shown.
 */
export function createScenario1(): ViewRestrictionScenario {
  return new ViewRestrictionScenarioBuilder()
    .withId('S1')
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
 * **S2**: No repository selected, the user can't create one.
 *
 * **Given**: a user with read-only rights and a valid license opens a page that requires a selected repository, and no
 * repository is selected.
 *
 * **Expected**: the page content is hidden and the user is asked to select a repository. The picker offers all local
 * repositories, but the create repository button is not shown.
 */
export function createScenario2(): ViewRestrictionScenario {
  return new ViewRestrictionScenarioBuilder()
    .withId('S2')
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
 * **S3**: Invalid license, no repository selected, the page doesn't declare the license restriction.
 *
 * **Given**: an admin with an invalid license opens a page that requires a selected repository, but doesn't declare the
 * license restriction, and no repository is selected.
 *
 * **Expected**: the page content is hidden and the user is asked to select a repository, without an invalid license
 * message. The picker offers all local repositories, but the create repository button is not shown, because a
 * repository can't be created with an invalid license.
 */
export function createScenario3(): ViewRestrictionScenario {
  return new ViewRestrictionScenarioBuilder()
    .withId('S3')
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
 * **S4**: All restrictions declared, none applies.
 *
 * **Given**: an admin with a valid license opens a page that declares all restrictions and works only with GraphDB
 * repositories, and a GraphDB repository is selected.
 *
 * **Expected**: the page content is shown, without restriction messages, picker or create repository button.
 */
export function createScenario4(): ViewRestrictionScenario {
  return new ViewRestrictionScenarioBuilder()
    .withId('S4')
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
 * **S5**: Several restrictions apply at once.
 *
 * **Given**: a user with read-only rights and an invalid license opens a page that declares all restrictions and works
 * only with GraphDB repositories, and a GraphDB repository is selected.
 *
 * **Expected**: the page content is hidden and three messages are shown, in order: the license is invalid (with a link
 * to set a new license), there are no writable repositories, and the user can't write to the selected repository.
 * The picker is empty and the create repository button is not shown.
 */
export function createScenario5(): ViewRestrictionScenario {
  return new ViewRestrictionScenarioBuilder()
    .withId('S5')
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
 * **S6**: Invalid license, security OFF, no repository selected.
 *
 * **Given**: security is OFF and the license is invalid. A page that requires a selected repository and declares the
 * license restriction is opened, and no repository is selected.
 *
 * **Expected**: the page content is hidden and two messages are shown, in order: the license is invalid (with a link to
 * set a new license), and the user is asked to select a repository. The picker offers all local repositories, but the
 * create repository button is not shown.
 */
export function createScenario6(): ViewRestrictionScenario {
  return new ViewRestrictionScenarioBuilder()
    .withId('S6')
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
 * **S7**: FedX repository selected.
 *
 * **Given**: an admin with a valid license opens a page that doesn't support Ontop and FedX repositories and works only
 * with GraphDB repositories, and a FedX repository is selected.
 *
 * **Expected**: the page content is hidden and a message says that the page doesn't support FedX repositories. The picker
 * offers only the GraphDB repositories and the create repository button is shown.
 */
export function createScenario7(): ViewRestrictionScenario {
  return new ViewRestrictionScenarioBuilder()
    .withId('S7')
    .withRestrictions([IS_REPOSITORY_NOT_SELECTED, IS_ONTOP, IS_FEDEX])
    .withAllowedRepositoryTypes([RepositoryType.GRAPH_DB])
    .withValidLicense()
    .withUser('admin')
    .withRepositories(REPOSITORIES)
    .withSelectedRepository(FEDX_REPO)
    .withExpectedContentHidden()
    .withExpectedMessages([{key: 'fedx_unsupported', params: {pageTitle: 'Reactodia'}}])
    .withExpectedPicker([REPO_A_ID, REPO_B_ID])
    .withExpectedCreateButtonShown()
    .build();
}

/**
 * **S8**: Ontop repository selected, the user has write rights.
 *
 * **Given**: an admin with a valid license opens a page that doesn't support Ontop repositories and works with GraphDB and
 * FedX repositories, and an Ontop repository is selected.
 *
 * **Expected**: the page content is hidden and a message says that the selected Ontop repository is read-only. The picker
 * offers the GraphDB and FedX repositories and the create repository button is shown.
 */
export function createScenario8(): ViewRestrictionScenario {
  return new ViewRestrictionScenarioBuilder()
    .withId('S8')
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
 * **S9**: Ontop repository selected, the user has no write rights.
 *
 * **Given**: a user with read-only rights and a valid license opens a page that doesn't support Ontop repositories and
 * works with GraphDB and FedX repositories, and an Ontop repository is selected.
 *
 * **Expected**: the page content is hidden and a message says that the selected Ontop repository is read-only. The picker
 * offers the GraphDB and FedX repositories, but the create repository button is not shown.
 */
export function createScenario9(): ViewRestrictionScenario {
  return new ViewRestrictionScenarioBuilder()
    .withId('S9')
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
 * **S10**: Missing write permission on an Ontop repository.
 *
 * **Given**: a user who can write only to `repo-a`, with a valid license, opens a page that requires write access, doesn't
 * support Ontop repositories and works with GraphDB and FedX repositories, and an Ontop repository is selected.
 *
 * **Expected**: the page content is hidden and only the message that the user can't write to the selected repository is
 * shown. The picker offers only `repo-a`, the one writable repository, and the create repository button is not shown.
 */
export function createScenario10(): ViewRestrictionScenario {
  return new ViewRestrictionScenarioBuilder()
    .withId('S10')
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
 * **S11**: Missing write permission, no writable repositories.
 *
 * **Given**: a user with read-only rights and a valid license opens a page that requires write access, and a GraphDB
 * repository is selected.
 *
 * **Expected**: the page content is hidden and two messages are shown, in order: there are no writable repositories, and
 * the user can't write to the selected repository. The picker is empty and the create repository button is not shown.
 */
export function createScenario11(): ViewRestrictionScenario {
  return new ViewRestrictionScenarioBuilder()
    .withId('S11')
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
 * **S12**: No repository selected, no writable repositories.
 *
 * **Given**: a user with read-only rights and a valid license opens a page that requires write access, and no repository
 * is selected.
 *
 * **Expected**: the page content is hidden and only the message that there are no writable repositories is shown. The
 * picker is empty and the create repository button is not shown.
 */
export function createScenario12(): ViewRestrictionScenario {
  return new ViewRestrictionScenarioBuilder()
    .withId('S12')
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
 * **S13**: No accessible repositories, the user can create one.
 *
 * **Given**: an admin with a valid license opens a page that requires a selected repository and works only with
 * repositories of a type that none of the existing repositories has, and no repository is selected.
 *
 * **Expected**: the page content is hidden and a message says that there are no accessible repositories and offers to
 * create one. The picker is empty and the create repository button is shown.
 */
export function createScenario13(): ViewRestrictionScenario {
  return new ViewRestrictionScenarioBuilder()
    .withId('S13')
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
 * **S14**: FedX repository selected, the user has no write rights, the page doesn't require write access.
 *
 * **Given**: a user with read-only rights and a valid license opens a page that doesn't support Ontop and FedX repositories
 * and works only with GraphDB repositories, and a FedX repository is selected.
 *
 * **Expected**: the page content is hidden and a message says that the page doesn't support FedX repositories. The picker
 * offers only the GraphDB repositories, but the create repository button is not shown.
 */
export function createScenario14(): ViewRestrictionScenario {
  return new ViewRestrictionScenarioBuilder()
    .withId('S14')
    .withRestrictions([IS_REPOSITORY_NOT_SELECTED, IS_ONTOP, IS_FEDEX])
    .withAllowedRepositoryTypes([RepositoryType.GRAPH_DB])
    .withValidLicense()
    .withUser('reader')
    .withRepositories(REPOSITORIES)
    .withSelectedRepository(FEDX_REPO)
    .withExpectedContentHidden()
    .withExpectedMessages([{key: 'fedx_unsupported', params: {pageTitle: 'Reactodia'}}])
    .withExpectedPicker([REPO_A_ID, REPO_B_ID])
    .withExpectedCreateButtonHidden()
    .build();
}

/**
 * **S15**: A page that requires write access, security OFF.
 *
 * **Given**: security is OFF and the license is valid. A page that requires write access is opened, and a GraphDB
 * repository is selected.
 *
 * **Expected**: the page content is shown, because with security OFF everyone can write. No restriction messages, picker
 * or create repository button are shown.
 */
export function createScenario15(): ViewRestrictionScenario {
  return new ViewRestrictionScenarioBuilder()
    .withId('S15')
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
 * **S16**: No repository selected, a remote location is attached.
 *
 * **Given**: an admin with a valid license opens a page that requires a selected repository, a remote location with its own
 * repository is attached, and no repository is selected.
 *
 * **Expected**: the page content is hidden and the user is asked to select or create a repository. The picker offers only
 * the local repositories, not the remote one, and the create repository button is shown.
 */
export function createScenario16(): ViewRestrictionScenario {
  return new ViewRestrictionScenarioBuilder()
    .withId('S16')
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
 * **S17**: No repositories at all, the user can create one.
 *
 * **Given**: an admin with a valid license opens a page that requires a selected repository, and there are no repositories.
 *
 * **Expected**: the page content is hidden and a message says that there are no accessible repositories and offers to
 * create one. The picker is empty and the create repository button is shown.
 */
export function createScenario17(): ViewRestrictionScenario {
  return new ViewRestrictionScenarioBuilder()
    .withId('S17')
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
