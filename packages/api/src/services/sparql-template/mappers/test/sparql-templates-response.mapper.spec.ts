import {mapSparqlTemplatesResponseToModel} from '../sparql-templates-response.mapper';
import {service} from '../../../../providers';
import {RepositoryContextService} from '../../../repository';
import {SparqlTemplatesResponse} from '../../response';
import {REPOSITORY_ID_PARAM, Repository} from '../../../../models/repositories';

jest.mock('../../../../providers', () => ({
  service: jest.fn(),
}));

const mockService = service as jest.MockedFunction<typeof service>;

// TODO: replace these tests with tests through service when the service is implemented at some point.
describe('SparqlTemplatesResponseMapper', () => {
  let mockRepositoryContextService: RepositoryContextService;

  beforeEach(() => {
    mockRepositoryContextService = {
      getSelectedRepository: jest.fn(),
    } as unknown as RepositoryContextService;

    mockService.mockImplementation((serviceClass) => {
      if (serviceClass === RepositoryContextService) {
        return mockRepositoryContextService;
      }
      throw new Error(`Unknown service class: ${serviceClass.name}`);
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('mapSparqlTemplatesResponseToModel', () => {
    it('should map sparql templates response to model with repository id', () => {
      // Given I have a selected repository and raw template data
      const templateId1 = 'http://example.org/template1';
      const templateId2 = 'http://example.org/template2';
      const templateId3 = 'http://example.org/template3';
      const rawData: SparqlTemplatesResponse = [templateId1, templateId2, templateId3];
      const repositoryId = 'test-repo';

      jest.spyOn(mockRepositoryContextService, 'getSelectedRepository').mockReturnValue({
        id: repositoryId,
      } as Repository);

      // When I map the raw data to the model
      const result = mapSparqlTemplatesResponseToModel(rawData);

      // Then I expect the result to have the correct structure with repository id in href
      expect(result).toEqual({
        items: [
          {
            id: templateId1,
            href: `sparql-template/create?${REPOSITORY_ID_PARAM}=${repositoryId}&templateID=${encodeURIComponent(templateId1)}`,
          },
          {
            id: templateId2,
            href: `sparql-template/create?${REPOSITORY_ID_PARAM}=${repositoryId}&templateID=${encodeURIComponent(templateId2)}`,
          },
          {
            id: templateId3,
            href: `sparql-template/create?${REPOSITORY_ID_PARAM}=${repositoryId}&templateID=${encodeURIComponent(templateId3)}`,
          },
        ],
      });
    });

    it('should map sparql templates response to model without repository id when no repository is selected', () => {
      // Given I have no selected repository and raw template data
      const templateId1 = 'http://example.org/template1';
      const templateId2 = 'http://example.org/template2';
      const rawData: SparqlTemplatesResponse = [templateId1, templateId2];

      jest.spyOn(mockRepositoryContextService, 'getSelectedRepository').mockReturnValue(undefined);

      // When I map the raw data to the model
      const result = mapSparqlTemplatesResponseToModel(rawData);

      // Then I expect the result to have the correct structure without repository id in href
      expect(result).toEqual({
        items: [
          {
            id: templateId1,
            href: `sparql-template/create?templateID=${encodeURIComponent(templateId1)}`,
          },
          {
            id: templateId2,
            href: `sparql-template/create?templateID=${encodeURIComponent(templateId2)}`,
          },
        ],
      });
    });

    it('should handle empty array', () => {
      // Given I have an empty array
      const rawData: SparqlTemplatesResponse = [];

      jest.spyOn(mockRepositoryContextService, 'getSelectedRepository').mockReturnValue({
        id: 'test-repo',
      } as Repository);

      // When I map the raw data to the model
      const result = mapSparqlTemplatesResponseToModel(rawData);

      // Then I expect the result to have an empty items array
      expect(result).toEqual({
        items: [],
      });
    });

    it('should treat null input as empty list', () => {
      // Given I have null data
      const rawData = null as unknown as SparqlTemplatesResponse;

      jest.spyOn(mockRepositoryContextService, 'getSelectedRepository').mockReturnValue({
        id: 'test-repo',
      } as Repository);

      // When I map the raw data to the model
      const result = mapSparqlTemplatesResponseToModel(rawData);

      // Then I expect the result to have an empty items array
      expect(result).toEqual({
        items: [],
      });
    });

    it('should treat undefined input as empty list', () => {
      // Given I have undefined data
      const rawData = undefined as unknown as SparqlTemplatesResponse;

      jest.spyOn(mockRepositoryContextService, 'getSelectedRepository').mockReturnValue({
        id: 'test-repo',
      } as Repository);

      // When I map the raw data to the model
      const result = mapSparqlTemplatesResponseToModel(rawData);

      // Then I expect the result to have an empty items array
      expect(result).toEqual({
        items: [],
      });
    });

    it('should properly encode template IDs with special characters in href', () => {
      // Given I have template IDs with special characters
      const templateId1 = 'http://example.org/template with spaces';
      const templateId2 = 'http://example.org/template?param=value&other=test';
      const templateId3 = 'http://example.org/template#fragment';
      const rawData: SparqlTemplatesResponse = [templateId1, templateId2, templateId3];
      const repositoryId = 'test-repo';

      jest.spyOn(mockRepositoryContextService, 'getSelectedRepository').mockReturnValue({
        id: repositoryId,
      } as Repository);

      // When I map the raw data to the model
      const result = mapSparqlTemplatesResponseToModel(rawData);

      // Then I expect the template IDs to be properly encoded in the href
      expect(result.items[0].href).toBe(
        `sparql-template/create?${REPOSITORY_ID_PARAM}=${repositoryId}&templateID=${encodeURIComponent(templateId1)}`
      );
      expect(result.items[1].href).toBe(
        `sparql-template/create?${REPOSITORY_ID_PARAM}=${repositoryId}&templateID=${encodeURIComponent(templateId2)}`
      );
      expect(result.items[2].href).toBe(
        `sparql-template/create?${REPOSITORY_ID_PARAM}=${repositoryId}&templateID=${encodeURIComponent(templateId3)}`
      );
      // Verify the IDs themselves are not encoded
      expect(result.items[0].id).toBe(templateId1);
      expect(result.items[1].id).toBe(templateId2);
      expect(result.items[2].id).toBe(templateId3);
    });

    it('should handle single template', () => {
      // Given I have a single template
      const templateId = 'http://example.org/template1';
      const rawData: SparqlTemplatesResponse = [templateId];
      const repositoryId = 'test-repo';

      jest.spyOn(mockRepositoryContextService, 'getSelectedRepository').mockReturnValue({
        id: repositoryId,
      } as Repository);

      // When I map the raw data to the model
      const result = mapSparqlTemplatesResponseToModel(rawData);

      // Then I expect the result to have a single item
      expect(result.items).toHaveLength(1);
      expect(result.items[0]).toEqual({
        id: templateId,
        href: `sparql-template/create?${REPOSITORY_ID_PARAM}=${repositoryId}&templateID=${encodeURIComponent(templateId)}`,
      });
    });
  });
});

