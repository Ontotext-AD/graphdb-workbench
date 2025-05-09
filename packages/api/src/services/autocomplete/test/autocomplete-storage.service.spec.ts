import {AutocompleteStorageService} from '../autocomplete-storage.service';

describe('Autocomplete storage service', () => {
  let service: AutocompleteStorageService;

  beforeEach(() => {
    service = new AutocompleteStorageService();
  });

  test('Should set and determine the enabled state', () => {
    service.setEnabled(true);
    expect(service.isEnabled()).toEqual(true);

    service.setEnabled(false);
    expect(service.isEnabled()).toEqual(false);
  });
});
