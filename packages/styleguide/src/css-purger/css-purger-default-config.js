/**
 * @fileoverview Configuration options for the CSS Variable Purger
 */

/**
 * Default configuration for CSS variable purging
 * @typedef {Object} CSSPurgerConfig
 * @property {string} inputFile - Path to the input CSS file containing all variables
 * @property {string} outputFile - Path where the purged CSS file will be written
 * @property {string[]} searchPaths - Glob patterns for files to scan for CSS variable usage
 * @property {string[]} safelist - CSS variables to always keep, regardless of usage
 * @property {RegExp[]} safelistPatterns - Regex patterns for CSS variable families to keep
 * @property {string[]} ignorePaths - Paths to ignore during file scanning
 * @property {boolean} debug - Enable detailed logging output
 * @property {boolean} includeStringReferences - Include CSS variables found in string literals
 * @property {boolean} includeDependencies - Include variables that are dependencies of used variables
 */

/**
 * Default configuration for the CSS Variable Purger
 * @type {CSSPurgerConfig}
 */
const DEFAULT_CONFIG = {
  // Input/Output files
  inputFile: require.resolve('graphwise-styleguide/dist/variables.css'),
  outputFile: 'src/css/variables-optimized.css',

  // File scanning patterns
  searchPaths: [
    '../legacy-workbench/**/*.{html,js,ts,jsx,tsx,scss,css}',
    '../workbench/**/*.{html,js,ts,jsx,tsx,scss,css}',
    '../shared-components/**/*.{html,js,ts,jsx,tsx,scss,css}',
    '../root-config/**/*.{html,js,ts,jsx,tsx,scss,css}',
  ],

  // Paths to ignore during scanning
  ignorePaths: [
    '../**/node_modules/**',
    '../**/dist/**',
    '../**/.git/**',
    '../**/variables-optimized.css',
    '**/node_modules/**',
    '**/dist/**',
    '**/.git/**',
    '**/variables-optimized.css',
  ],

  // Variables to always preserve
  safelist: [],

  // Regex patterns for variable families to preserve
  safelistPatterns: [],

  // Processing options
  debug: false,
  includeStringReferences: true,
  includeDependencies: true,
};

module.exports = {
  DEFAULT_CONFIG,
};
