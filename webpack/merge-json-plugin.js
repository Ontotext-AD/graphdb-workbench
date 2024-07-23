const fs = require('fs-extra');
const path = require('path');

class MergeJsonPlugin {
    static defaultOptions = {
        output: 'merged-output.json',
        files: []
    };

    constructor(options = {}) {
        this.options = { ...MergeJsonPlugin.defaultOptions, ...options };
    }

    apply(compiler) {
        const pluginName = MergeJsonPlugin.name;
        const { webpack } = compiler;
        const { Compilation } = webpack;
        const { RawSource } = webpack.sources;

        compiler.hooks.thisCompilation.tap(pluginName, (compilation) => {
            compilation.hooks.processAssets.tapPromise(
                {
                    name: pluginName,
                    stage: Compilation.PROCESS_ASSETS_STAGE_SUMMARIZE,
                },
                async (assets) => {
                    try {
                        const mergedResult = {};

                        for (const file of this.options.files) {
                            const filePath = path.resolve(compiler.context, file);
                            if (await fs.pathExists(filePath)) {
                                const fileContent = await fs.readJson(filePath);
                                Object.assign(mergedResult, fileContent);
                            } else {
                                console.error(`File not found: ${filePath}`);
                            }
                        }

                        const outputPath = path.resolve(compiler.context, this.options.output);
                        const outputDir = path.dirname(outputPath);
                        await fs.ensureDir(outputDir);

                        const mergedJsonContent = JSON.stringify(mergedResult, null, 2);
                        compilation.emitAsset(this.options.output, new RawSource(mergedJsonContent));
                        console.log(`Merged JSON saved to ${this.options.output}`);
                    } catch (error) {
                        console.error('Error merging JSON files:', error);
                    }
                }
            );
        });
    }
}

module.exports = { MergeJsonPlugin };
