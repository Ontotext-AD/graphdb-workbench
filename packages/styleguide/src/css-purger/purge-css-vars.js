/**
 * @fileoverview CLI script for CSS Variable Purger
 * Command-line interface for removing unused CSS custom properties from stylesheets
 */

/* eslint-env node */

const CSSVariablePurger = require('./CSS-variable-purger');

// CLI usage
if (require.main === module) {
  const args = process.argv.slice(2);
  const options = {};

  // Parse command line arguments
  for (let i = 0; i < args.length; i += 2) {
    const key = args[i].replace(/^--/, '');
    const value = args[i + 1];

    switch (key) {
    case 'input':
      options.inputFile = value;
      break;
    case 'output':
      options.outputFile = value;
      break;
    case 'debug':
      options.debug = value === 'true';
      break;
    case 'include-dependencies':
      options.includeDependencies = value === 'true';
      break;
    case 'include-string-refs':
      options.includeStringReferences = value === 'true';
      break;
    }
  }

  const purger = new CSSVariablePurger(options);

  purger
    .purgeUnusedVariables()
    .then((result) => {
      // eslint-disable-next-line no-console
      console.log('\n✨ Purge completed successfully!');
      // eslint-disable-next-line no-console
      console.log(
        `📁 Output file contains ${result.usedVariables} used variables`
      );
      // eslint-disable-next-line no-console
      console.log(`🗑️  Removed ${result.removedVariables} unused variables`);
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Purge failed:', error.message);
      if (options.debug) {

        console.error(error.stack);
      }
      process.exit(1);
    });
}

module.exports = CSSVariablePurger;
