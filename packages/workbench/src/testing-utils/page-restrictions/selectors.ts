/**
 * The selectors of the page layout elements checked by the page restriction tests.
 */
export const PAGE_LAYOUT_RESTRICTIONS_SELECTORS = {
  viewContent: '[data-test="view-content"]',
  pageRestrictions: 'app-page-restrictions',
  restrictionMessage: '[data-test="page-restriction-message"]',
  restrictionLink: '[data-test="restriction-internal-link"]',
  repositoryPicker: 'app-repository-picker-list',
  pickerSelectButton: '[data-test="repository-picker-select-btn"]',
  pickerRepositoryCount: '[data-test="repository-picker-results-count"]',
  pickerRepositoryCountAccessible: '[data-test="repository-picker-results-count-accessible"]',
  pickerRepositoryId: '[data-test="repository-picker-repository-id"]',
  pickerRepositoryState: '[data-test="repository-picker-repository-state"]',
  pickerRepositoryStateLabel: '[data-test="repository-picker-repository-state-label"]',
  pickerRepositoryType: '[data-test="repository-picker-repository-type"]',
  pickerRepositoryTypeLabel: '[data-test="repository-picker-repository-type-label"]',
  createRepositoryButton: '[data-test="repository-picker-create-btn"]',
  nameFilter: '.filter-name input',
  localOnlyFilter: '#localOnly',
  repositoryLocation: '[data-test="repository-picker-repository-location"]',
  pageTitle: '.title-container',
};
