import {LoaderSteps} from '../../steps/onto-loader/loader-steps';

const DEFAULT_LOADER_SIZE = 100;
const SMALL_LOADER_SIZE = 50;
const LARGE_LOADER_SIZE = 150;

describe('OntoLoader', () => {
  beforeEach(() => {
    LoaderSteps.visit();
  });

  it('should render preset loader variants', () => {
    LoaderSteps.assertLoaderSize('loader-default', DEFAULT_LOADER_SIZE);
    LoaderSteps.getMessage('loader-default').should('not.exist');

    LoaderSteps.assertLoaderSize('loader-small', SMALL_LOADER_SIZE);
    LoaderSteps.assertMessageSize('loader-small', SMALL_LOADER_SIZE);
    LoaderSteps.getMessage('loader-small').should('contain.text', 'Loading small data...');

    LoaderSteps.assertLoaderSize('loader-large', LARGE_LOADER_SIZE);
    LoaderSteps.assertMessageSize('loader-large', LARGE_LOADER_SIZE);
    LoaderSteps.getMessage('loader-large').should('contain.text', 'Loading data...');
  });
});

