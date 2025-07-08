import {ResourceSearchStorageService} from '../resource-search-storage.service';
import {Suggestion, SuggestionType} from '../../../models/rdf-search';

describe('Resource Search Store Service', () => {
  let service: ResourceSearchStorageService;

  beforeEach(() => {
    service = new ResourceSearchStorageService();
  });

  test('Should store and retrieve the input value', () => {
    service.setInputValue('example');
    expect(service.getInputValue()).toEqual('example');
  });

  test('Should store and retrieve the last selected suggestion', () => {
    const suggestion = new Suggestion({value: 'example', type: SuggestionType.URI});
    service.setLastSelected(suggestion);
    expect(service.getLastSelectedValue()).toEqual('example');
  });

  test('Should clear the search history', () => {
    service.setInputValue('example');
    expect(service.getInputValue()).toEqual('example');
    service.clearStoredSearch();
    expect(service.getInputValue()).toEqual('');
    expect(service.getLastSelectedValue()).toEqual('');
  });

  test('Should return empty string for missing keys', () => {
    expect(service.getLastSelectedValue()).toEqual('');
    expect(service.getInputValue()).toEqual('');
  });

  test('Should store and retrieve selected view', () => {
    expect(service.getSelectedView()).toEqual('');
    const TABLE_VIEW = 'table';
    service.setSelectedView(TABLE_VIEW);
    expect(service.getSelectedView()).toEqual(TABLE_VIEW);

    const VISUAL_VIEW = 'visual';
    service.setSelectedView(VISUAL_VIEW);
    expect(service.getSelectedView()).toEqual(VISUAL_VIEW);
  });
});
