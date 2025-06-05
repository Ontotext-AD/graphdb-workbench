import StyleDictionary from "style-dictionary";
import { register, expandTypesMap } from "@tokens-studio/sd-transforms";

// will register them on StyleDictionary object
// that is installed as a dependency of this package.
register(StyleDictionary);

const sd = new StyleDictionary({
  source: ["tokens/prime/**/*.json"],
  preprocessors: ["tokens-studio"], // <-- since 0.16.0 this must be explicit
  expand: {
    typesMap: expandTypesMap,
  },
  platforms: {
    css: {
      buildPath: "src/css/",
      prefix: "p",
      // transforms: ["attribute/cti", "name/cti/kebab", "dimension/pixelToRem"],
      // transformGroup: "css",
      transformGroup: "tokens-studio", // <-- apply the tokens-studio transformGroup to apply all transforms
      transforms: ["name/kebab"],
      files: [
        {
          format: "css/variables",
          destination: "variables.css",
          options: {
            // outputReferences: true,
            //   selector: ".gdb",
            //   outputReferenceFallbacks: true
          },
        },
      ],
    },
  },
});

await sd.cleanAllPlatforms();
await sd.buildAllPlatforms();
