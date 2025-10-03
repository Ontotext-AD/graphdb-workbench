const CSSVariablePurger = require('../src/css-purger/CSS-variable-purger');

const options = {};
options.inputFile = undefined;
options.outputFile = undefined;
options.debug = 'true';
options.includeDependencies = 'true';
options.includeStringReferences = 'true';

function purge(opts) {
  const purger = new CSSVariablePurger(opts);
  return purger
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
    })
    .catch((error) => {
      console.error('\n❌ Purge failed:', error.message);
      if (opts.debug) {

        console.error(error.stack);
      }
      process.exit(1);
    });
}

purge({
  ...options,
  inputFile: require.resolve('graphwise-styleguide/dist/variables-light.css'),
  outputFile: 'src/css/light-mode.css'
}).then(() => {
  return purge({
    ...options,
    inputFile: require.resolve('graphwise-styleguide/dist/variables-dark.css'),
    outputFile: 'src/css/dark-mode.css'
  });
});
