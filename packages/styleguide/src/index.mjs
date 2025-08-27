import StyleDictionary from 'style-dictionary';
import { register, expandTypesMap } from '@tokens-studio/sd-transforms';

// will register them on StyleDictionary object
// that is installed as a dependency of this package.
register(StyleDictionary, {
  excludeParentKeys: true,
});

const SOURCE_GLOB = 'tokens/**/*.json';

// Define the configuration using the Config type from style-dictionary
const configuration = {
  source: [SOURCE_GLOB],
  preprocessors: ['tokens-studio'],
  expand: {
    typesMap: expandTypesMap,
  },
  // You can enable more detailed error logging if needed
  log: {
    errors: {
      brokenReferences: 'console',
    },
    verbosity: 'verbose',
  },
  platforms: {
    css: {
      buildPath: 'src/css/',
      prefix: 'gw',
      // The 'tokens-studio' transformGroup applies a comprehensive set of transforms.
      // It's a great starting point provided by the sd-transforms package.
      transformGroup: 'tokens-studio',
      // You can still add or override specific transforms if needed.
      // For example, if you wanted a different naming convention.
      transforms: ['name/kebab'],
      files: [
        {
          format: 'css/variables',
          destination: 'variables.css',
          // Filter out tokens that are specific to Figma and not needed in the final CSS.
          filter: (token) => !token.path.includes('figma'),
          options: {
            // This ensures that your CSS variables can reference other CSS variables.
            outputReferences: true,
            // Example of other options you could use:
            // selector: '.gdb', // to scope variables to a specific class
            // outputReferenceFallbacks: true // to add fallbacks for references
          },
        },
      ],
    },
  },
};

// Create a new Style Dictionary instance with the configuration.
const sd = new StyleDictionary(configuration);

/**
 * Main build function to run Style Dictionary.
 * Using an async function allows us to use top-level await.
 */
async function main() {
  // eslint-disable-next-line no-console
  console.log('########## Cleaning old platform files ##########');
  await sd.cleanAllPlatforms();

  // eslint-disable-next-line no-console
  console.log('########## Building all platforms ##########');
  await sd.buildAllPlatforms();

  // eslint-disable-next-line no-console
  console.log('########## Build complete! ##########');
}

// Execute the build process.
main().catch((error) => console.error('########## Error during build:', error));
