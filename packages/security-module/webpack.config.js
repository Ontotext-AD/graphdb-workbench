const {merge} = require("webpack-merge");
const singleSpaDefaults = require("webpack-config-single-spa-ts");

module.exports = (webpackConfigEnv, argv) => {
    const defaultConfig = singleSpaDefaults({
        orgName: "ontotext",
        projectName: "security-module",
        webpackConfigEnv,
        argv,
    });

    return merge(defaultConfig, {
        // modify the webpack config however you'd like to by adding to this object
    });
};
