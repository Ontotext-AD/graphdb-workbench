const webpack = require('webpack');
const PACKAGE = require('./package.json');
const CopyPlugin = require('copy-webpack-plugin');
const MergeIntoSingleFilePlugin = require('webpack-merge-and-include-globally');
const {merge} = require("webpack-merge");
const singleSpaDefaults = require("webpack-config-single-spa");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const path = require("path");

// The "string-replace-loader" replaces the version in all HTML and JS files except those copied by CopyPlugin.
// This function must be used as the transform parameter of the plugin to replace the version.
const replaceVersion = (content) => content.toString().replace(/\[AIV]{version}\[\/AIV]/g, PACKAGE.version);

const host = 'localhost';
const portHere = 9000;
const portThere = 7200;

module.exports = (webpackConfigEnv, argv) => {
    const orgName = "ontotext";
    const defaultConfig = singleSpaDefaults({
        orgName,
        projectName: "root-config",
        webpackConfigEnv,
        argv,
        disableHtmlGeneration: true,
    });

    defaultConfig.module.rules = [];

    return merge(defaultConfig, {
        entry: {
            main: './packages/root-config/src/ontotext-root-config.js',
            legacyWorkbench: './packages/legacy-workbench/src/index.js'
        },
        output: {
            filename: '[name].js',
            chunkFilename: '[name].bundle.js',
            path: path.resolve(__dirname, 'dist'),
            libraryTarget: "system",
            publicPath: '/'
        },
        resolve: {
            modules: [
                './packages/legacy-workbench/src/js/',
                './packages/legacy-workbench/node_modules',
                './packages/root-config/src/js/',
                './packages/root-config/node_modules'
            ],
            extensions: ['.js']
        },
        externals: ["@ontotext/workbench-api"],
        // modify the webpack config however you'd like to by adding to this object
        plugins: [
            new HtmlWebpackPlugin({
                inject: false,
                template: "packages/root-config/src/index.ejs",
                templateParameters: (compilation, assets, assetTags, options) => {
                    return {
                    isLocal: webpackConfigEnv && webpackConfigEnv.isLocal,
                    orgName,
                    mainBundle: Object.keys(compilation.assets).find(asset => asset.includes('main') && asset.endsWith('.js')),
                    legacyWorkbenchBundle:  Object.keys(compilation.assets).find(asset => asset.includes('legacyWorkbench') && asset.endsWith('.js')),
                    contentHash: assets.contentHash,
                    buildVersion: PACKAGE.version
                    };
                },
                chunks: ['main'],
                filename: 'index.html'
            }),
            new webpack.DefinePlugin({
                version: JSON.stringify(require("./package.json").version)
            }),
            new MergeIntoSingleFilePlugin({
                files: {
                    "plugins.js": [
                        'packages/legacy-workbench/src/**/plugin.js'
                    ]
                }
            }),
            new CopyPlugin({
                patterns: [
                    {
                        from: 'packages/legacy-workbench/src/js/angular/plugin-registry.js',
                        to: 'plugin-registry.js'
                    },
                    {
                        from: 'packages/legacy-workbench/node_modules/angularjs-slider/dist/rzslider.min.css',
                        to: 'js/lib/rzslider/rzslider.min.css'
                    },
                    {
                        from: 'packages/legacy-workbench/src/js/lib/angucomplete-alt/angucomplete-alt.css',
                        to: 'js/lib/angucomplete-alt/angucomplete-alt.css'
                    },
                    {
                        from: 'packages/legacy-workbench/src/js/lib/d3-tip/d3-tip.css',
                        to: 'js/lib/d3-tip/d3-tip.css'
                    },
                    {
                        from: 'packages/legacy-workbench/src/js/angular/templates/loader/ot-loader.svg',
                        to: 'js/angular/templates/loader/ot-loader.svg'
                    },
                    {
                        from: 'packages/legacy-workbench/node_modules/ng-tags-input/build/ng-tags-input.min.css',
                        to: 'css/lib/ng-tags-input/ng-tags-input.min.css'
                    },
                    {
                        from: 'packages/legacy-workbench/node_modules/angular-xeditable/dist/css/xeditable.min.css',
                        to: 'css/lib/angular-xeditable/xeditable.min.css'
                    },
                    {
                        from: 'packages/legacy-workbench/src/js/lib/bootstrap/bootstrap.min.css',
                        to: 'js/lib/bootstrap/bootstrap.min.css'
                    },
                    {
                        from: 'packages/legacy-workbench/node_modules/font-awesome/css',
                        to: 'font/font-awesome/4.3.0/css'
                    },
                    {
                        from: 'packages/legacy-workbench/node_modules/font-awesome/fonts',
                        to: 'font/font-awesome/4.3.0/fonts'
                    },
                    {
                        from: 'packages/legacy-workbench/src/css',
                        to: 'css'
                    },
                    {
                        from: 'packages/legacy-workbench/src/res',
                        to: 'res',
                        transform: replaceVersion
                    },
                    {
                        from: 'packages/legacy-workbench/src/pages',
                        to: 'pages',
                        transform: replaceVersion
                    },
                    {
                        from: 'packages/legacy-workbench/src/i18n',
                        to: 'i18n'
                    },
                    {
                        from: 'packages/legacy-workbench/src/js/angular/repositories/templates',
                        to: 'js/angular/repositories/templates'
                    },
                    {
                        from: 'packages/legacy-workbench/src/js/angular/autocomplete/templates',
                        to: 'js/angular/autocomplete/templates'
                    },
                    {
                        from: 'packages/legacy-workbench/src/js/angular/chatgpt/templates',
                        to: 'js/angular/chatgpt/templates'
                    },
                    {
                        from: 'packages/legacy-workbench/src/js/angular/clustermanagement/templates',
                        to: 'js/angular/clustermanagement/templates'
                    },
                    {
                        from: 'packages/legacy-workbench/src/js/angular/core/templates',
                        to: 'js/angular/core/templates'
                    },
                    {
                        from: 'packages/legacy-workbench/src/js/angular/explore/templates',
                        to: 'js/angular/explore/templates'
                    },
                    {
                        from: 'packages/legacy-workbench/src/js/angular/externalsync/templates',
                        to: 'js/angular/externalsync/templates'
                    },
                    {
                        from: 'packages/legacy-workbench/src/js/angular/graphexplore/templates',
                        to: 'js/angular/graphexplore/templates'
                    },
                    {
                        from: 'packages/legacy-workbench/src/js/angular/import/templates',
                        to: 'js/angular/import/templates'
                    },
                    {
                        from: 'packages/legacy-workbench/src/js/angular/rdfrank/templates',
                        to: 'js/angular/rdfrank/templates'
                    },
                    {
                        from: 'packages/legacy-workbench/src/js/angular/security/templates',
                        to: 'js/angular/security/templates',
                        transform: replaceVersion
                    },
                    {
                        from: 'packages/legacy-workbench/src/js/angular/settings/modal',
                        to: 'js/angular/settings/modal'
                    },
                    {
                        from: 'packages/legacy-workbench/src/js/angular/core/directives/rdfresourcesearch/templates',
                        to: 'js/angular/core/directives/rdfresourcesearch/templates',
                        transform: replaceVersion
                    },
                    {
                        from: 'packages/legacy-workbench/src/js/angular/core/directives/languageselector/templates',
                        to: 'js/angular/core/directives/languageselector/templates',
                        transform: replaceVersion
                    },
                    {
                        from: 'packages/legacy-workbench/src/js/angular/core/directives/operations-statuses-monitor/templates',
                        to: 'js/angular/core/directives/operations-statuses-monitor/templates',
                        transform: replaceVersion
                    },
                    {
                        from: 'packages/legacy-workbench/src/js/angular/core/directives/autocomplete/templates',
                        to: 'js/angular/core/directives/autocomplete/templates',
                        transform: replaceVersion
                    },
                    {
                        from: 'packages/legacy-workbench/src/js/angular/core/directives/yasgui-component/templates',
                        to: 'js/angular/core/directives/yasgui-component/templates',
                        transform: replaceVersion
                    },
                    {
                        from: 'packages/legacy-workbench/src/js/angular/core/components/export-settings-modal',
                        to: 'js/angular/core/components/export-settings-modal',
                        transform: replaceVersion
                    },
                    {
                        from: 'packages/legacy-workbench/src/js/angular/templates',
                        to: 'js/angular/templates'
                    }
                ]
            })
        ],
        module: {
            rules: [
                {
                    test: /\.(js|html)$/,
                    loader: 'string-replace-loader',
                    options: {
                        search: /\[AIV\]{version}\[\/AIV\]/g,
                        replace: PACKAGE.version
                    }
                },
                {
                    test: /\.(md|gzip|map)$/,
                    use: 'ignore-loader'
                },
                {
                    test: /jquery.js/,
                    loader: "expose-loader",
                    options: {
                        exposes: ["$", "jQuery"],
                    },
                },
                {
                    test: /d3.js/,
                    loader: "expose-loader",
                    options: {
                        exposes: ["d3"],
                    },
                },
                {
                    test: /\.html$/,
                    use: [
                        {
                            loader: 'html-loader',
                            options: {
                                attrs: ['img:src', 'object:data', 'use:href']
                                // sources: true
                            }
                        }
                    ]
                },
                {
                    test: /\.(svg|png|jpg|gif)$/,
                    type: 'asset/resource',
                    generator: {
                        filename: 'img/[name].[hash].[ext]'
                    }
                },
                {
                    test: /\.woff(2)?(\?v=\d+\.\d+\.\d+)?$/,
                    type: 'asset/resource',
                    generator: {
                        filename: 'res/swagger5/fonts/[name].[ext]'
                    }
                },
                {
                    test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/,
                    type: 'asset/resource',
                    generator: {
                        filename: 'font/[name].[hash].[ext]'
                    }
                },
                {
                    test: /\.eot(\?v=\d+\.\d+\.\d+)?$/,
                    type: 'asset/resource',
                    generator: {
                        filename: 'font/[name].[hash].[ext]'
                    }
                },
                {
                    test: /\.(png|jpg|jpeg|gif)$/,
                    type: 'asset/resource',
                    generator: {
                        filename: '[name].[hash].[ext]'
                    }
                },
                {
                    test: /\.(ttl|ttls|trig|trigs)$/,
                    type: 'asset/resource',
                    generator: {
                        filename: '[name].[hash].[ext]'
                    }
                }
            ]
        },
    });
};
