import {ProductInfo} from '../product-info';

describe('ProductInfo', () => {
  /**
   * Test cases containing the GraphDB product version and its expected short version.
   *
   * Each couple contains:
   * - The full GraphDB version.
   * - The expected short version.
   */
  const SHORT_VERSION_TEST_CASES: [string, string][] = [
    // Release versions
    ['10.0.0', '10.0'],
    ['10.7.1', '10.7'],
    ['15.0.0', '15.0'],
    ['10.0', '10.0'],

    // Versions with attributes—the first attribute is kept
    ['10.0.0-M3-RC1', '10.0-M3'],
    ['10.0.0-RC1', '10.0-RC1'],
    ['15.0.0-SNAPSHOT', '15.0-SNAPSHOT'],

    // Development versions following the semantic versioning pattern
    ['15.0-SNAPSHOT', '15.0-SNAPSHOT'],

    // Versions without a minor part
    ['15-SNAPSHOT', '15-SNAPSHOT'],
    ['15', '15'],
    ['15.0.0-', '15.0'],

    // Versions not following the expected pattern
    ['master', 'master'],
    ['master-SNAPSHOT', 'master-SNAPSHOT'],
    ['v10.0.0', 'v10.0.0'],

    // Versions with surrounding whitespace
    [' 10.0.0-M3 ', '10.0-M3'],

    // Missing versions
    ['', ''],
    ['   ', ''],
  ];

  const createProductInfo = (productVersion: string): ProductInfo =>
    new ProductInfo({
      workbench: '3.0.0',
      productType: 'GraphDB',
      productVersion,
      sesame: '',
      connectors: '',
      ontop: '',
    });

  describe('shortVersion', () => {
    test.each(SHORT_VERSION_TEST_CASES)(
      'should resolve the short version of "%s" to "%s"',
      (productVersion, expected) => {
        expect(createProductInfo(productVersion).shortVersion).toBe(expected);
      }
    );

    test('should resolve to an empty string when the product version is not provided', () => {
      const productInfo = new ProductInfo(
        {} as Omit<ProductInfo, 'shortVersion'>
      );

      expect(productInfo.shortVersion).toBe('');
    });
  });
});
