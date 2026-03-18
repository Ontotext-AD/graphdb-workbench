import {GuidesService} from '../guides.service';
import {LanguageContextService} from '../../../language';
import {OntoToastrService} from '../../../toastr';
import {service} from '../../../../providers';
import {InteractiveGuide} from '../../../../models/plugins/plugins/interactive-guide/interactive-guide';
import {RepositoryList} from '../../../../models/repositories/repository-list';
import {Repository} from '../../../../models/repositories';
import {WindowService} from '../../../window';
import {PluginRegistry} from '../../../plugins';
import {ShepherdService} from '../shepherd.service';
import {GuideContextService} from '../guide-context.service';
import {RepositoryContextService} from '../../repository';
import {GuidesRestService} from '../guides-rest.service';

// jsdom does not support DOMParser#body.innerText — mock it globally
globalThis.DOMParser = jest.fn().mockImplementation(() => ({
  parseFromString: jest.fn((html: string) => ({
    body: {innerText: html},
  })),
}));

describe('GuidesService', () => {
  let guidesService: GuidesService;
  const languageContextService = service(LanguageContextService);
  const repositoryContextService = service(RepositoryContextService);
  const toastrService = service(OntoToastrService);
  const shepherdService = service(ShepherdService);
  const guideContextService = service(GuideContextService);

  beforeEach(() => {
    jest.spyOn(languageContextService, 'getLanguageBundle').mockReturnValue(undefined);
    jest.spyOn(languageContextService, 'getDefaultBundle').mockReturnValue(undefined);
    jest.spyOn(languageContextService, 'getSelectedLanguage').mockReturnValue('en');
    jest.spyOn(languageContextService, 'getDefaultLanguage').mockReturnValue('en');
    jest.spyOn(repositoryContextService, 'getRepositoryList').mockReturnValue(new RepositoryList([]));
    jest.spyOn(toastrService, 'error');
    jest.spyOn(shepherdService, 'startGuide').mockImplementation();
    jest.spyOn(shepherdService, 'resumeGuide').mockImplementation();
    jest.spyOn(guideContextService, 'updatePaused').mockImplementation();
    jest.spyOn(WindowService, 'getPluginRegistry').mockReturnValue({get: jest.fn()} as unknown as PluginRegistry);
    guidesService = new GuidesService();
  });

  describe('startGuide', () => {
    beforeEach(() => {
      jest.spyOn(languageContextService, 'getLanguageBundle').mockReturnValue({
        language: 'en',
        'guides.error.guide-not-found': 'Guide not found',
      });
    });

    test('should show an error toast and return early when guide is undefined', () => {
      guidesService.startGuide(undefined, {});

      expect(toastrService.error).toHaveBeenCalledWith('Guide not found');
    });

    test('should not call getRepositoryList when guide has no repositoryIdBase', () => {
      guidesService.startGuide((new InteractiveGuide({steps: [], })), {});

      expect(repositoryContextService.getRepositoryList).not.toHaveBeenCalled();
    });

    test('should not show error toast when a valid guide is provided', () => {
      guidesService.startGuide((new InteractiveGuide({steps: []})), {});

      expect(toastrService.error).not.toHaveBeenCalled();
    });

    test('should set repositoryId to repositoryIdBase when no conflict exists', () => {
      const repositoryList = new RepositoryList([]);
      jest.spyOn(repositoryList, 'findRepository').mockReturnValue(undefined);
      jest.spyOn(repositoryContextService, 'getRepositoryList').mockReturnValue(repositoryList);

      const guide = new InteractiveGuide({steps: [], options: {repositoryIdBase: 'myrepo'}});
      guidesService.startGuide(guide, {});

      expect(repositoryList.findRepository).toHaveBeenCalledWith('myrepo', '', true);
    });

    test('should increment repositoryId suffix when base ID already exists', () => {
      const repositoryList = new RepositoryList([]);
      jest.spyOn(repositoryList, 'findRepository')
        .mockReturnValueOnce({id: 'myrepo'} as Repository)   // 'myrepo' exists
        .mockReturnValueOnce({id: 'myrepo2'} as Repository)  // 'myrepo2' exists
        .mockReturnValueOnce(undefined);               // 'myrepo3' is free
      jest.spyOn(repositoryContextService, 'getRepositoryList').mockReturnValue(repositoryList);

      guidesService.startGuide(new InteractiveGuide({steps: [], options: {repositoryIdBase: 'myrepo'}}), {});

      expect(repositoryList.findRepository).toHaveBeenCalledTimes(3);
      expect(repositoryList.findRepository).toHaveBeenNthCalledWith(1, 'myrepo', '', true);
      expect(repositoryList.findRepository).toHaveBeenNthCalledWith(2, 'myrepo2', '', true);
      expect(repositoryList.findRepository).toHaveBeenNthCalledWith(3, 'myrepo3', '', true);
    });

    test('should translate the guide name using the language bundle', () => {
      jest.spyOn(languageContextService, 'getLanguageBundle').mockReturnValue({
        language: 'en',
        'my-guide-name': 'My Guide',
      });

      const InteractiveGuideSpy = jest.spyOn(InteractiveGuide.prototype, 'setTranslatedGuideName');
      guidesService.startGuide(new InteractiveGuide({steps: [], guideName: 'my-guide-name'}), {});

      expect(InteractiveGuideSpy).toHaveBeenCalledWith('My Guide');
    });

    test('should set paused to false in GuideContextService when guide starts successfully', () => {
      guidesService.startGuide(new InteractiveGuide({steps: []}), {});

      expect(guideContextService.updatePaused).toHaveBeenCalledWith(false);
    });

    test('should not set paused when guide is undefined', () => {
      guidesService.startGuide(undefined, {});

      expect(guideContextService.updatePaused).not.toHaveBeenCalled();
    });

    test('should translate the guide description using the language bundle', () => {
      jest.spyOn(languageContextService, 'getLanguageBundle').mockReturnValue({
        language: 'en',
        'my-guide-desc': 'My Description',
      });

      const InteractiveGuideSpy = jest.spyOn(InteractiveGuide.prototype, 'setTranslatedGuideDescription');
      guidesService.startGuide(new InteractiveGuide({steps: [], guideDescription: 'my-guide-desc'}), {});

      expect(InteractiveGuideSpy).toHaveBeenCalledWith('My Description');
    });
  });

  describe('getGuides', () => {
    let guidesRestService: GuidesRestService;

    beforeEach(() => {
      guidesRestService = service(GuidesRestService);
    });

    test('should return an empty array when the REST service returns an empty array', async () => {
      jest.spyOn(guidesRestService, 'getGuides').mockResolvedValue([]);

      const result = await guidesService.getGuides();

      expect(result).toEqual([]);
    });

    test('should convert each response item to an InteractiveGuide instance', async () => {
      jest.spyOn(guidesRestService, 'getGuides').mockResolvedValue([{guideId: '1', steps: []}]);

      const result = await guidesService.getGuides();

      expect(result).toHaveLength(1);
      expect(result[0]).toBeInstanceOf(InteractiveGuide);
      expect(result[0].getId()).toBe('1');
    });

    test('should convert a numeric guideId to a string', async () => {
      jest.spyOn(guidesRestService, 'getGuides').mockResolvedValue([{guideId: 42, steps: []}]);

      const result = await guidesService.getGuides();

      expect(result[0].getId()).toBe('42');
    });
  });

  describe('autoStartGuide', () => {
    let guidesRestService: GuidesRestService;

    beforeEach(() => {
      guidesRestService = service(GuidesRestService);
      jest.spyOn(languageContextService, 'getLanguageBundle').mockReturnValue({language: 'en'});
    });

    test('should do nothing when autoStartGuideId is falsy', () => {
      jest.spyOn(guidesRestService, 'getGuides');

      guidesService.autoStartGuide('', {});

      expect(guidesRestService.getGuides).not.toHaveBeenCalled();
    });

    test('should call startGuide with the matching guide and isAutoStarted=true', async () => {
      jest.spyOn(guidesRestService, 'getGuides').mockResolvedValue([{guideId: 'guide-1', steps: []}]);
      const startGuideSpy = jest.spyOn(guidesService, 'startGuide').mockImplementation();

      guidesService.autoStartGuide('guide-1', {});
      await new Promise(process.nextTick);

      expect(startGuideSpy).toHaveBeenCalledWith(expect.any(InteractiveGuide), {}, undefined, true);
    });

    test('should not call startGuide when no guide matches the given ID', async () => {
      jest.spyOn(guidesRestService, 'getGuides').mockResolvedValue([{guideId: 'other-guide', steps: []}]);
      const startGuideSpy = jest.spyOn(guidesService, 'startGuide').mockImplementation();

      guidesService.autoStartGuide('guide-1', {});
      await new Promise(process.nextTick);

      expect(startGuideSpy).not.toHaveBeenCalled();
    });

    test('should coerce a numeric ID to string when matching guides', async () => {
      jest.spyOn(guidesRestService, 'getGuides').mockResolvedValue([{guideId: '42', steps: []}]);
      const startGuideSpy = jest.spyOn(guidesService, 'startGuide').mockImplementation();

      guidesService.autoStartGuide(42, {});
      await new Promise(process.nextTick);

      expect(startGuideSpy).toHaveBeenCalledWith(expect.any(InteractiveGuide), {}, undefined, true);
    });
  });
});
