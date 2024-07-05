const {merge} = require("webpack-merge");
const singleSpaDefaults = require("webpack-config-single-spa-ts");

module.exports = (webpackConfigEnv, argv) => {
    const defaultConfig = singleSpaDefaults({
        orgName: "ontotext",
        projectName: "workbench-api",
        webpackConfigEnv,
        argv,
    });

    return merge(defaultConfig, {
        // modify the webpack config however you'd like to by adding to this object
        devServer: {
            port: process.env.API_PORT
        }
    });
};
