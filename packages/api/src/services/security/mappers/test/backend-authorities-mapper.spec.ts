import {AuthorityList} from '../../../../models/security';
import {BackendAuthoritiesMapper} from '../backend-authorities-mapper';

describe('BackendAuthoritiesMapper', () => {
  let mapper: BackendAuthoritiesMapper;

  beforeEach(() => {
    mapper = new BackendAuthoritiesMapper();
  });

  test('should return empty array when no authorities provided', () => {
    // Given an empty authority list
    const authorityList = new AuthorityList([]);

    // When mapping to backend authorities
    const result = mapper.mapToModel(authorityList);

    // Then the result should be empty
    expect(result).toEqual([]);
  });

  test('should map read authority for a single repository', () => {
    // Given a read authority for repository 'repo1'
    const authorityList = new AuthorityList(['READ_REPO_repo1']);

    // When mapping to backend authorities
    const result = mapper.mapToModel(authorityList);

    // Then the result should contain the read authority
    expect(result).toEqual(['READ_REPO_repo1']);
  });

  test('should map write authority for a single repository with implicit read', () => {
    // Given a write authority for repository 'repo1'
    const authorityList = new AuthorityList(['WRITE_REPO_repo1']);

    // When mapping to backend authorities
    const result = mapper.mapToModel(authorityList);

    // Then the result should contain both write and read authorities
    expect(result).toContain('WRITE_REPO_repo1');
    expect(result).toContain('READ_REPO_repo1');
    expect(result).toHaveLength(2);
  });

  test('should map read and write authorities for the same repository', () => {
    // Given both read and write authorities for repository 'repo1'
    const authorityList = new AuthorityList(['READ_REPO_repo1', 'WRITE_REPO_repo1']);

    // When mapping to backend authorities
    const result = mapper.mapToModel(authorityList);

    // Then the result should contain both write and read authorities
    expect(result).toContain('WRITE_REPO_repo1');
    expect(result).toContain('READ_REPO_repo1');
    expect(result).toHaveLength(2);
  });

  test('should map GraphQL read authority for a single repository', () => {
    // Given GraphQL and read authorities for repository 'repo1'
    const authorityList = new AuthorityList(['GRAPHQL_repo1', 'READ_REPO_repo1']);

    // When mapping to backend authorities
    const result = mapper.mapToModel(authorityList);

    // Then the result should contain read authority with GraphQL suffix
    expect(result).toEqual(['READ_REPO_repo1:GRAPHQL']);
  });

  test('should map GraphQL write authority for a single repository', () => {
    // Given GraphQL and write authorities for repository 'repo1'
    const authorityList = new AuthorityList(['GRAPHQL_repo1', 'WRITE_REPO_repo1']);

    // When mapping to backend authorities
    const result = mapper.mapToModel(authorityList);

    // Then the result should contain write and read authorities with GraphQL suffix
    expect(result).toContain('WRITE_REPO_repo1:GRAPHQL');
    expect(result).toContain('READ_REPO_repo1:GRAPHQL');
    expect(result).toHaveLength(2);
  });

  test('should map authorities for multiple repositories', () => {
    // Given authorities for multiple repositories
    const authorityList = new AuthorityList([
      'READ_REPO_repo1',
      'WRITE_REPO_repo2'
    ]);

    // When mapping to backend authorities
    const result = mapper.mapToModel(authorityList);

    // Then the result should contain authorities for all repositories
    expect(result).toContain('READ_REPO_repo1');
    expect(result).toContain('WRITE_REPO_repo2');
    expect(result).toContain('READ_REPO_repo2');
    expect(result).toHaveLength(3);
  });

  test('should preserve custom authorities', () => {
    // Given custom authorities mixed with repository authorities
    const authorityList = new AuthorityList([
      'ROLE_ADMIN',
      'READ_REPO_repo1',
      'ROLE_USER'
    ]);

    // When mapping to backend authorities
    const result = mapper.mapToModel(authorityList);

    // Then custom authorities should be preserved
    expect(result).toContain('ROLE_ADMIN');
    expect(result).toContain('ROLE_USER');
    expect(result).toContain('READ_REPO_repo1');
    expect(result).toHaveLength(3);
  });

  test('should handle wildcard read authority', () => {
    // Given a wildcard read authority
    const authorityList = new AuthorityList(['READ_REPO_*']);

    // When mapping to backend authorities
    const result = mapper.mapToModel(authorityList);

    // Then the result should contain the wildcard read authority
    expect(result).toEqual(['READ_REPO_*']);
  });

  test('should handle wildcard write authority', () => {
    // Given a wildcard write authority
    const authorityList = new AuthorityList(['WRITE_REPO_*']);

    // When mapping to backend authorities
    const result = mapper.mapToModel(authorityList);

    // Then the result should contain wildcard write and read authorities
    expect(result).toContain('WRITE_REPO_*');
    expect(result).toContain('READ_REPO_*');
    expect(result).toHaveLength(2);
  });

  test('should apply wildcard read to specific repository authorities', () => {
    // Given wildcard read and specific repository write authority
    const authorityList = new AuthorityList([
      'READ_REPO_*',
      'WRITE_REPO_repo1'
    ]);

    // When mapping to backend authorities
    const result = mapper.mapToModel(authorityList);

    // Then specific repository should have write and read, and wildcard read should exist
    expect(result).toContain('READ_REPO_*');
    expect(result).toContain('WRITE_REPO_repo1');
    expect(result).toContain('READ_REPO_repo1');
    expect(result).toHaveLength(3);
  });

  test('should apply wildcard write to specific repository authorities', () => {
    // Given wildcard write and specific repository read authority
    const authorityList = new AuthorityList([
      'WRITE_REPO_*',
      'READ_REPO_repo1'
    ]);

    // When mapping to backend authorities
    const result = mapper.mapToModel(authorityList);

    // Then wildcard write applies to repo1 (write implies read), and wildcard authorities are included
    expect(result).toContain('WRITE_REPO_*');
    expect(result).toContain('READ_REPO_*');
    expect(result).toContain('READ_REPO_repo1');
    expect(result).toHaveLength(3);
  });

  test('should handle wildcard GraphQL with specific repository', () => {
    // Given wildcard GraphQL and specific repository read authority
    const authorityList = new AuthorityList([
      'GRAPHQL_*',
      'READ_REPO_repo1'
    ]);

    // When mapping to backend authorities
    const result = mapper.mapToModel(authorityList);

    // Then specific repository should have read with GraphQL suffix (wildcard GraphQL applies to it)
    expect(result).toContain('READ_REPO_repo1:GRAPHQL');
    expect(result).toHaveLength(1);
  });

  test('should handle GraphQL with wildcard write', () => {
    // Given GraphQL for specific repository and wildcard write authority
    const authorityList = new AuthorityList([
      'GRAPHQL_repo1',
      'WRITE_REPO_*'
    ]);

    // When mapping to backend authorities
    const result = mapper.mapToModel(authorityList);

    // Then specific repository should have write and read with GraphQL suffix, and wildcard should have write and read
    expect(result).toContain('WRITE_REPO_repo1:GRAPHQL');
    expect(result).toContain('READ_REPO_repo1:GRAPHQL');
    expect(result).toContain('WRITE_REPO_*');
    expect(result).toContain('READ_REPO_*');
    expect(result).toHaveLength(4);
  });

  test('should handle complex scenario with multiple repositories and GraphQL', () => {
    // Given multiple authorities with GraphQL and regular permissions
    const authorityList = new AuthorityList([
      'ROLE_ADMIN',
      'READ_REPO_repo1',
      'WRITE_REPO_repo2',
      'GRAPHQL_repo2',
      'READ_REPO_repo3'
    ]);

    // When mapping to backend authorities
    const result = mapper.mapToModel(authorityList);

    // Then all authorities should be correctly mapped
    expect(result).toContain('ROLE_ADMIN');
    expect(result).toContain('READ_REPO_repo1');
    expect(result).toContain('WRITE_REPO_repo2:GRAPHQL');
    expect(result).toContain('READ_REPO_repo2:GRAPHQL');
    expect(result).toContain('READ_REPO_repo3');
    expect(result).toHaveLength(5);
  });

  test('should handle all wildcard authorities with GraphQL', () => {
    // Given all wildcard authorities including GraphQL
    const authorityList = new AuthorityList([
      'READ_REPO_*',
      'WRITE_REPO_*',
      'GRAPHQL_*'
    ]);

    // When mapping to backend authorities
    const result = mapper.mapToModel(authorityList);

    // Then wildcard authorities should have GraphQL suffix
    expect(result).toContain('WRITE_REPO_*:GRAPHQL');
    expect(result).toContain('READ_REPO_*:GRAPHQL');
    expect(result).toHaveLength(2);
  });

  test('should handle repository without GraphQL when wildcard GraphQL exists', () => {
    // Given wildcard GraphQL and repository without GraphQL
    const authorityList = new AuthorityList([
      'GRAPHQL_*',
      'READ_REPO_repo1',
      'WRITE_REPO_repo2'
    ]);

    // When mapping to backend authorities
    const result = mapper.mapToModel(authorityList);

    // Then wildcard GraphQL applies to all repositories
    expect(result).toContain('READ_REPO_repo1:GRAPHQL');
    expect(result).toContain('WRITE_REPO_repo2:GRAPHQL');
    expect(result).toContain('READ_REPO_repo2:GRAPHQL');
    expect(result).toHaveLength(3);
  });
});

