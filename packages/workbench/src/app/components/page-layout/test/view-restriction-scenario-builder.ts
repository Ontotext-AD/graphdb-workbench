import {Repository, RepositoryType, ViewRestrictionCondition} from '@ontotext/workbench-api';
import {TestUser} from './view-restriction-scenarios';

/**
 * The restriction message keys under `components.page_restrictions`.
 */
export type PageRestrictionMessageKey =
  | 'no_active_repository_select_one'
  | 'no_active_repository_select_or_create_one'
  | 'no_accessible_repos_create_one'
  | 'no_accessible_repositories'
  | 'invalid_license'
  | 'no_write_permission'
  | 'read_only_ontop'
  | 'fedx_unsupported'
  | 'no_accessible_writable_repos';

/**
 * The GraphDB license state. `missing` means that no license is loaded.
 */
export type TestLicense = 'valid' | 'invalid' | 'missing';

export interface ExpectedViewRestrictionMessage {
  key: PageRestrictionMessageKey;
  params?: Record<string, string>;
  /**
   * Whether the message offers the "Set a new license" link.
   */
  hasLicenseLink?: boolean;
}

export interface ViewRestrictionScenario {
  description: string;
  restrictions: ViewRestrictionCondition[];
  allowedRepositoryTypes?: RepositoryType[];
  license: TestLicense;
  /**
   * The logged-in user. Undefined means that security is OFF.
   */
  user?: TestUser;
  repositories: Repository[];
  selectedRepository?: Repository;
  expected: {
    contentShown: boolean;
    messages: ExpectedViewRestrictionMessage[];
    /**
     * The repository ids offered by the picker, in display order. Undefined means that the picker is not shown.
     */
    pickerRepositoryIds?: string[];
    createButton: boolean;
  };
}

/**
 * Builds a {@link ViewRestrictionScenario}. The description is generated from the scenario input, so it always matches it.
 */
export class ViewRestrictionScenarioBuilder {
  private restrictions: ViewRestrictionCondition[] = [];
  private allowedRepositoryTypes?: RepositoryType[];
  private license: TestLicense = 'valid';
  private user?: TestUser;
  private repositories: Repository[] = [];
  private selectedRepository?: Repository;
  private contentShown = false;
  private messages: ExpectedViewRestrictionMessage[] = [];
  private pickerRepositoryIds?: string[];
  private createButton = false;

  /**
   * Sets the restriction conditions the page declares. The page is checked only against these conditions; an undeclared
   * condition never restricts it, even when it applies.
   */
  withRestrictions(restrictions: ViewRestrictionCondition[]): this {
    this.restrictions = restrictions;
    return this;
  }

  /**
   * Sets the repository types the page works with. The picker offers only repositories of these types.
   * If not set, repositories of all types are allowed.
   */
  withAllowedRepositoryTypes(allowedRepositoryTypes?: RepositoryType[]): this {
    this.allowedRepositoryTypes = allowedRepositoryTypes;
    return this;
  }

  /**
   * Sets a valid GraphDB license. This is the default.
   */
  withValidLicense(): this {
    this.license = 'valid';
    return this;
  }

  /**
   * Sets an invalid GraphDB license. It restricts the page when the page declares
   * {@link ViewRestrictionCondition.IS_LICENSE_INVALID}, and prevents the user from creating a repository.
   */
  withInvalidLicense(): this {
    this.license = 'invalid';
    return this;
  }

  /**
   * Sets no GraphDB license, as when none is loaded. It restricts the page like an invalid license.
   */
  withMissingLicense(): this {
    this.license = 'missing';
    return this;
  }

  /**
   * Turns security ON and logs in the given user, with the authorities defined for that user in the test.
   * The user's rights decide the write permission checks, the writable repositories in the picker and whether the
   * create repository button is offered.
   */
  withUser(user: TestUser): this {
    this.user = user;
    return this;
  }

  /**
   * Turns security OFF, so no user is logged in and every user check passes. This is the default.
   */
  withSecurityOff(): this {
    this.user = undefined;
    return this;
  }

  /**
   * Sets the repositories that exist in GraphDB, i.e. the ones the picker can offer. Defaults to no repositories.
   */
  withRepositories(repositories: Repository[]): this {
    this.repositories = repositories;
    return this;
  }

  /**
   * Sets the repository selected before the page is rendered. If not set, no repository is selected.
   */
  withSelectedRepository(selectedRepository?: Repository): this {
    this.selectedRepository = selectedRepository;
    return this;
  }

  /**
   * Expects the page to be unrestricted: the view content is rendered and the restrictions are not.
   */
  withExpectedContentShown(): this {
    this.contentShown = true;
    return this;
  }

  /**
   * Expects the page to be restricted: the restrictions are rendered instead of the view content. This is the default.
   */
  withExpectedContentHidden(): this {
    this.contentShown = false;
    return this;
  }

  /**
   * Sets the restriction messages expected on the page, in display order. Defaults to no messages.
   */
  withExpectedMessages(messages: ExpectedViewRestrictionMessage[]): this {
    this.messages = messages;
    return this;
  }

  /**
   * Expects the repository picker to be shown, offering exactly the given repository ids in display order.
   */
  withExpectedPicker(pickerRepositoryIds: string[]): this {
    this.pickerRepositoryIds = pickerRepositoryIds;
    return this;
  }

  /**
   * Expects the repository picker not to be shown. This is the default.
   */
  withExpectedPickerHidden(): this {
    this.pickerRepositoryIds = undefined;
    return this;
  }

  /**
   * Expects the picker to offer the create repository button.
   */
  withExpectedCreateButtonShown(): this {
    this.createButton = true;
    return this;
  }

  /**
   * Expects the create repository button not to be offered. This is the default.
   */
  withExpectedCreateButtonHidden(): this {
    this.createButton = false;
    return this;
  }

  /**
   * Builds the scenario, generating its description from the scenario input.
   */
  build(): ViewRestrictionScenario {
    return {
      description: this.describe(),
      restrictions: this.restrictions,
      allowedRepositoryTypes: this.allowedRepositoryTypes,
      license: this.license,
      user: this.user,
      repositories: this.repositories,
      selectedRepository: this.selectedRepository,
      expected: {
        contentShown: this.contentShown,
        messages: this.messages,
        pickerRepositoryIds: this.pickerRepositoryIds,
        createButton: this.createButton,
      },
    };
  }

  /**
   * Describes the scenario input, e.g. "user 'reader', invalid license, repository 'repo-a' selected,
   * repositories [repo-a, repo-b], restrictions [IS_REPOSITORY_NOT_SELECTED, IS_ONTOP], allowed types [graphdb]".
   */
  private describe(): string {
    const parts = [
      this.user ? `user '${this.user}'` : 'security OFF',
      this.license === 'missing' ? 'no license' : `${this.license} license`,
      this.selectedRepository ? `repository '${this.selectedRepository.id}' selected` : 'no repository selected',
      this.repositories.length
        ? `repositories [${this.repositories.map(({id}) => id).join(', ')}]`
        : 'no repositories',
      `restrictions [${this.restrictions.join(', ')}]`,
    ];
    if (this.allowedRepositoryTypes) {
      parts.push(`allowed types [${this.allowedRepositoryTypes.join(', ')}]`);
    }
    return parts.join(', ');
  }
}
