const {merge} = require("webpack-merge");
const singleSpaDefaults = require("webpack-config-single-spa");

module.exports = (webpackConfigEnv, argv) => {
    const defaultConfig = singleSpaDefaults({
        orgName: "ontotext",
        projectName: "workbench-api",
        webpackConfigEnv,
        argv,
    });

    const isProduction = argv && argv.mode === "production";

    return merge(defaultConfig, {
        entry: './components-dist/esm/loader.js',
        output: {
            filename: isProduction
                ? 'ontotext-shared-components.[contenthash].js'
                : 'ontotext-shared-components.js',
            chunkFilename: isProduction
                ? '[name].[contenthash].bundle.js'
                : '[name].bundle.js',
        },
    });
};
