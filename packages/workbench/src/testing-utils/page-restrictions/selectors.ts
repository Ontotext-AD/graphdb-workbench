/**
 * The selectors of the page layout elements checked by the page restriction tests.
 */
export const PAGE_LAYOUT_RESTRICTIONS_SELECTORS = {
  viewContent: '[data-test="view-content"]',
  pageRestrictions: 'app-page-restrictions',
  restrictionMessage: '[data-test="page-restriction-message"]',
  restrictionLink: '[data-test="restriction-internal-link"]',
  repositoryPicker: 'app-repository-picker-list',
  pickerRepositoryId: '[data-test="repository-picker-repository-id"]',
  createRepositoryButton: '[data-test="repository-picker-create-btn"]',
  nameFilter: '.filter-name input',
  localOnlyFilter: '#localOnly',
  repositoryLocation: '[data-test="repository-picker-repository-location"]',
  pageTitle: '.title-container',
};
