const fs = require('fs');
const path = require('path');
const webpack = require('webpack');
const { RawSource } = webpack.sources;

/**
 * A Webpack plugin for merging internationalization (i18n) JSON files from multiple directories.
 *
 * This plugin scans specified directories for i18n files, merges them by language,
 * and outputs the combined files to a specified directory, inside the output directory.
 */
class MergeI18nPlugin {
  constructor(options) {
    this.outputDirectory = options.outputDirectory;
    this.startDirectory = options.startDirectory;
  }

  apply(compiler) {
    const pluginName = 'MergeI18nPlugin';
    compiler.hooks.thisCompilation.tap(pluginName, compilation => {
      compilation.hooks.processAssets.tap(
        {
          name: pluginName,
          stage: compilation.constructor.PROCESS_ASSETS_STAGE_ADDITIONS,
        },
        () => {
          try {
            const topLevelDirectories = this.getTopLevelDirectories();
            console.log(`Merge i18n started in directories: ${topLevelDirectories.join(', ')}`);

            const mergedBundles = this.mergeBundles(topLevelDirectories);
            this.emitAssets(mergedBundles, compilation);

            console.log(`I18n bundles successfully merged and output to ${this.outputDirectory}`);
          } catch (err) {
            console.error(err);
          }
        }
      );
    });
  }

  /**
   * Merges all bundles, found in the specified top level directories.
   * Traverses the specified directories, checking each of them for a `src/assets/i18n` folders.
   * If such a folder is found, the contents will be merged into grouped files.
   *
   * For example `packages/shared-components/src/assets/i18n/en.json` and `packages/workbench/src/assets/i18n/en.json`
   * (provided they exist), will be merged into `this.outputDirectory/en.json`
   *
   * If duplicate keys are found, an error will be thrown.
   *
   * @param topLevelDirectories the directories to be checked for `src/assets/i18n` folders
   * @returns The merged bundles
   */
  mergeBundles(topLevelDirectories) {
    const mergedBundles = {};

    topLevelDirectories.forEach(dir => {
      const i18nPath = path.join(this.startDirectory, dir, 'src/assets/i18n');

      if (fs.existsSync(i18nPath) && fs.statSync(i18nPath).isDirectory()) {
        console.log(`Found i18n directory: ${i18nPath}`);
        const files = fs.readdirSync(i18nPath);

        files.forEach(file => {
          console.log(`Processing file: ${file}`);
          const language = path.basename(file, '.json');
          const filePath = path.join(i18nPath, file);
          const fileContent = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

          if (!mergedBundles[language]) {
            mergedBundles[language] = {};
          }

          Object.entries(fileContent).forEach(([key, value]) => {
            if (mergedBundles[language][key]) {
              throw new Error(
                `Conflict detected for key '${key}' in language '${language}' in file: ${filePath}`
              );
            }
            mergedBundles[language][key] = value;
          });
        });
      } else {
        console.log(`${i18nPath} directory doesn't exist`);
      }
    });
    return mergedBundles;
  }

  /**
   * Gets the top level directories under {@link this.startDirectory}
   * @returns {string[]} The directories, under {@link this.startDirectory}
   */
  getTopLevelDirectories() {
    return fs.readdirSync(this.startDirectory).filter((file) =>
      fs.statSync(path.join(this.startDirectory, file)).isDirectory()
    );
  }

  /**
   * Emits the assets in the output folder
   *
   * Takes the merged bundles as an object and writes them in the specified {@link this.outputDirectory}
   * @param mergedBundles The merged bundles, which should be written in the output folder
   * @param compilation The compilation object from the `thisCompilation` hook
   */
  emitAssets(mergedBundles, compilation) {
    Object.entries(mergedBundles).forEach(([language, data]) => {
      const outputPath = path.join(this.outputDirectory, `${language}.json`);
      compilation.emitAsset(
        outputPath,
        new RawSource(JSON.stringify(data, null, 2))
      );
      console.log(`Wrote I18n bundle for language '${language}' to: ${outputPath}`);
    });
  }
}

module.exports = { MergeI18nPlugin };
