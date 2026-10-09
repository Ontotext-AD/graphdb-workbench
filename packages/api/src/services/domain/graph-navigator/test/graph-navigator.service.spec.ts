import {GraphNavigatorService} from '../graph-navigator.service';
import {GraphNavigatorRestService} from '../graph-navigator-rest.service';
import {service} from '../../../../providers';
import {DEFAULT_SETTINGS_STUB} from './graph-navigator-settings-mock';
import {GraphNavigatorSettings} from '../../../../models/graph-navigator';

describe('GraphNavigatorService', () => {
  const REPOSITORY_ID = 'test-repo';
  let graphNavigatorService: GraphNavigatorService;
  let restService: GraphNavigatorRestService;

  beforeEach(() => {
    graphNavigatorService = new GraphNavigatorService();
    restService = service(GraphNavigatorRestService);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('getSettings', () => {
    it('should load the settings of the repository and map them', async () => {
      // GIVEN: the rest service returns the default settings.
      const getSpy = jest.spyOn(restService, 'getSettings')
        .mockResolvedValue({...DEFAULT_SETTINGS_STUB, uploaded: false});

      // WHEN: the settings are loaded.
      const settings = await graphNavigatorService.getSettings(REPOSITORY_ID);

      // THEN: the repository's settings are requested and mapped.
      expect(getSpy).toHaveBeenCalledWith(REPOSITORY_ID);
      expect(settings).toEqual(new GraphNavigatorSettings({uploaded: false, providerSettings: DEFAULT_SETTINGS_STUB}));
    });
  });

  describe('uploadSettings', () => {
    it('should upload the file and return the new settings', async () => {
      // GIVEN: the rest service returns the uploaded settings.
      const file = new File(['@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .'], 'settings.ttl', {type: 'text/turtle'});
      const uploadSpy = jest.spyOn(restService, 'uploadSettings')
        .mockResolvedValue({...DEFAULT_SETTINGS_STUB, uploaded: true, dataLabelProperty: 'skos:prefLabel'});

      // WHEN: the file is uploaded.
      const settings = await graphNavigatorService.uploadSettings(REPOSITORY_ID, file);

      // THEN: the file is sent for the repository and the returned settings are mapped.
      expect(uploadSpy).toHaveBeenCalledWith(REPOSITORY_ID, file);
      expect(settings).toEqual(new GraphNavigatorSettings({
        uploaded: true,
        providerSettings: {...DEFAULT_SETTINGS_STUB, dataLabelProperty: 'skos:prefLabel'}
      }));
    });

    it('should reject with the rest error when the file is rejected', async () => {
      // GIVEN: the backend rejects the file.
      const error = new Error('Invalid settings file');
      jest.spyOn(restService, 'uploadSettings').mockRejectedValue(error);

      // WHEN/THEN: the upload rejects with the same error.
      await expect(graphNavigatorService.uploadSettings(REPOSITORY_ID, new File([''], 'settings.ttl'))).rejects.toBe(error);
    });
  });

  describe('deleteSettings', () => {
    it('should delete the settings of the repository', async () => {
      // GIVEN: the rest service deletes the settings.
      const deleteSpy = jest.spyOn(restService, 'deleteSettings').mockResolvedValue();

      // WHEN: the settings are deleted.
      await graphNavigatorService.deleteSettings(REPOSITORY_ID);

      // THEN: the delete is sent for the repository.
      expect(deleteSpy).toHaveBeenCalledWith(REPOSITORY_ID);
    });
  });

  describe('exportSettings', () => {
    it('should return the settings of the repository as Turtle', async () => {
      // GIVEN: the rest service returns the Turtle.
      const turtle = '@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .';
      const exportSpy = jest.spyOn(restService, 'exportSettings').mockResolvedValue(turtle);

      // WHEN: the settings are exported.
      const result = await graphNavigatorService.exportSettings(REPOSITORY_ID);

      // THEN: the Turtle is returned unchanged.
      expect(exportSpy).toHaveBeenCalledWith(REPOSITORY_ID);
      expect(result).toBe(turtle);
    });
  });
});
