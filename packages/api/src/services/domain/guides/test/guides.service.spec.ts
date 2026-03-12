import {GuidesService} from '../guides.service';
import {LanguageContextService} from '../../../language';
import {OntoToastrService} from '../../../toastr';
import {service} from '../../../../providers';
import {InteractiveGuide} from '../../../../models/plugins/plugins/interactive-guide/interactive-guide';
import {RepositoryList} from '../../../../models/repositories/repository-list';
import {Repository} from '../../../../models/repositories';
import {InteractiveGuideResponse} from '../../../../models/plugins/plugins/interactive-guide/interactive-guide-response';
import {WindowService} from '../../../window';
import {PluginRegistry} from '../../../plugins';
import {ShepherdService} from '../shepherd.service';
import {GuideContextService} from '../guide-context.service';
import {RepositoryContextService} from '../../repository';

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
      guidesService.startGuide(({steps: [], } as InteractiveGuideResponse), {});

      expect(repositoryContextService.getRepositoryList).not.toHaveBeenCalled();
    });

    test('should not show error toast when a valid guide is provided', () => {
      guidesService.startGuide(({steps: [], } as InteractiveGuideResponse), {});

      expect(toastrService.error).not.toHaveBeenCalled();
    });

    test('should set repositoryId to repositoryIdBase when no conflict exists', () => {
      const repositoryList = new RepositoryList([]);
      jest.spyOn(repositoryList, 'findRepository').mockReturnValue(undefined);
      jest.spyOn(repositoryContextService, 'getRepositoryList').mockReturnValue(repositoryList);

      const guide = {steps: [], options: {repositoryIdBase: 'myrepo'}} as InteractiveGuideResponse;
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

      guidesService.startGuide({steps: [], options: {repositoryIdBase: 'myrepo'}} as InteractiveGuideResponse, {});

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
      guidesService.startGuide({steps: [], guideName: 'my-guide-name'} as InteractiveGuideResponse, {});

      expect(InteractiveGuideSpy).toHaveBeenCalledWith('My Guide');
    });

    test('should set paused to false in GuideContextService when guide starts successfully', () => {
      guidesService.startGuide({steps: []} as InteractiveGuideResponse, {});

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
      guidesService.startGuide({steps: [], guideDescription: 'my-guide-desc'} as InteractiveGuideResponse, {});

      expect(InteractiveGuideSpy).toHaveBeenCalledWith('My Description');
    });
  });
});
