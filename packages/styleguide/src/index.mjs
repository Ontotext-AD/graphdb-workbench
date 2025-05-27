import StyleDictionary from "style-dictionary-utils";

const config = {
  source: ["tokens/tokens.json"],
  platforms: {
    css: {
      buildPath: "src/css/",
      prefix: "gdb",
      transforms: ["attribute/cti", "name/cti/kebab", "dimension/pixelToRem"],
      files: [
        {
          format: "css/variables",
          destination: "variables.css",
          options: {
            outputReferences: true,
          },
        },
      ],
    },
  },
};

const sd = StyleDictionary.extend(config);
sd.buildAllPlatforms();
