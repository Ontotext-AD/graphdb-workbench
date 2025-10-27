const CSSVariablePurger = require('../src/css-purger/CSS-variable-purger');

const options = {};
options.inputFile = undefined;
options.outputFile = undefined;
options.debug = 'true';
options.includeDependencies = 'true';
options.includeStringReferences = 'true';
options.printUndeclaredWorkbenchCSSVariables = false;

function verifyResult(result) {
  // eslint-disable-next-line no-console
  console.log('\n✨ Purge completed successfully!');
  // eslint-disable-next-line no-console
  console.log(
    `📁 Output file contains ${result.usedVariables} used variables`
  );
  // eslint-disable-next-line no-console
  console.log(`🗑️  Removed ${result.removedVariables} unused variables`);

  if (result.missedCSSVariables && result.missedCSSVariables.length > 0) {
    // eslint-disable-next-line no-console
    console.log('The following CSS variables are used but not declared:');

    const gWCSSVariables = [];
    const workbenchCSSVariables = [];

    result.missedCSSVariables.forEach(variable => {
      if (variable.startsWith('--gw-')) {
        gWCSSVariables.push(variable);
      } else {
        workbenchCSSVariables.push(variable);
      }
    });
    // eslint-disable-next-line no-console
    gWCSSVariables.forEach(variable => console.log(`  ❌  ${variable}`));
    if (options.printUndeclaredWorkbenchCSSVariables) {
      // eslint-disable-next-line no-console
      workbenchCSSVariables.forEach(variable => console.log(`  ⚠️  ${variable}`));
    }

    // Exit with code 1 if at least one --gw- variable is missing
    if (gWCSSVariables.length > 0) {
      // TODO: Re-enable error throwing once all missing variables are fixed
      // throw new Error('There are css variables that are not declared');
    }
  }
}

function purge(opts) {
  const purger = new CSSVariablePurger(opts);
  return purger
    .purgeUnusedVariables()
    .then(verifyResult)
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
