const webpack = require('webpack');
const PACKAGE = require('./package.json');
const CopyPlugin = require('copy-webpack-plugin');
const MergeIntoSingleFilePlugin = require('webpack-merge-and-include-globally');
const {merge} = require("webpack-merge");
const singleSpaDefaults = require("webpack-config-single-spa");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const {MergeJsonPlugin} = require('./webpack/merge-json-plugin.js');
const {MergeI18nPlugin} = require('./webpack/merge-i18n-plugin.js');
const path = require("path");
const fs = require('fs');

// The "string-replace-loader" replaces the version in all HTML and JS files except those copied by CopyPlugin.
// This function must be used as the transform parameter of the plugin to replace the version.
const replaceVersion = (content) => content.toString().replace(/\[AIV]{version}\[\/AIV]/g, PACKAGE.version);

// Load the languages JSON file as a string for injection
const languagesConfig = JSON.stringify(
    JSON.parse(fs.readFileSync(path.resolve(__dirname, 'packages/legacy-workbench/src/i18n/languages.json'), 'utf8'))
);

const externalCSSs = [
    // pivot table
    'https://pivottable.js.org',
    // Google Charts
    'https://www.gstatic.com'
];

const externalJavaScripts = [
    'https://www.googletagmanager.com',
    'https://cdn.jsdelivr.net',
    // pivot table
    'https://cdnjs.cloudflare.com/ajax/libs/d3/7.8.5/d3.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/jquery/1.11.2/jquery.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/jqueryui/1.11.4/jquery-ui.min.js',
    'https://pivottable.js.org',
    // Google Charts
    'https://www.gstatic.com',
];

const externalImages = [
    // Google Charts
    'https://ssl.gstatic.com',
    'https://www.googletagmanager.com'
];

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
            legacyWorkbench: './packages/legacy-workbench/src/app.js'
        },
        output: {
            filename: '[name].js',
            chunkFilename: '[name].bundle.js',
            path: path.resolve(__dirname, 'dist'),
            libraryTarget: "module",
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
                        isDevelopmentMode: argv.env.BUILD_MODE === 'development',
                        devMode: argv.env.BUILD_MODE === 'development',
                        orgName,
                        mainBundle: Object.keys(compilation.assets).find(asset => asset.includes('main') && asset.endsWith('.js')),
                        legacyWorkbenchBundle:  Object.keys(compilation.assets).find(asset => asset.includes('legacyWorkbench') && asset.endsWith('.js')),
                        apiBundle: Object.keys(compilation.assets).find(asset => asset.includes('ontotext-workbench-api') && asset.endsWith('.js')),
                        workbenchAppBundle: Object.keys(compilation.assets).find(asset => asset.includes('workbenchApp') && asset.endsWith('.js')),
                        contentHash: assets.contentHash,
                        buildVersion: PACKAGE.version,
                        microFrontEndsUrls: 'http://localhost:9002 http://localhost:9003 ws://localhost:9003 ws://localhost:9002',
                        externalCSSs: externalCSSs.join(' '),
                        externalJavaScripts: externalJavaScripts.join(' '),
                        externalImages: externalImages.join(' ')
                    };
                },
                chunks: ['main'],
                filename: 'index.html'
            }),
            new webpack.DefinePlugin({
                version: JSON.stringify(require("./package.json").version),
                __LANGUAGES__: languagesConfig
            }),
            new MergeIntoSingleFilePlugin({
                files: {
                    "plugins.js": [
                        'packages/legacy-workbench/src/**/plugin.js'
                    ]
                }
            }),
            new MergeI18nPlugin({
              startDirectory: './packages',
              outputDirectory: 'assets/i18n'
            }),
            new MergeJsonPlugin({
                files: [
                    'packages/api/dist/license-checker.json',
                    'packages/legacy-workbench/dist/license-checker.json',
                    'packages/root-config/dist/license-checker.json',
                    'packages/shared-components/dist/license-checker.json',
                    'packages/workbench/dist/license-checker.json',
                ],
                output: 'license-checker.json'
            }),
            new CopyPlugin({
                patterns: [
                    {
                        from: 'packages/legacy-workbench/src/js/angular/plugin-registry.js',
                        to: 'plugin-registry.js'
                    },
                    {
                        from: 'packages/shared-components/src/assets',
                        to: 'assets',
                        filter: (sourcePath) => {
                          // Exclude i18n directory, as it is handled by the MergeI18nPlugin and doesn't need to be in assets
                          return !sourcePath.includes('i18n');
                        }
                    },
                    {
                      from: 'packages/root-config/src/assets',
                      to: 'assets',
                      filter: (sourcePath) => {
                        // Exclude i18n directory, as it is handled by the MergeI18nPlugin and doesn't need to be in assets
                        return !sourcePath.includes('i18n');
                      }
                    },
                    {
                      from: 'packages/root-config/src/styles/css',
                      to: 'css'
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
                        from: 'packages/legacy-workbench/src/js/angular/ttyg/templates',
                        to: 'js/angular/ttyg/templates',
                        transform: replaceVersion
                    },
                    {
                        from: 'packages/legacy-workbench/src/js/angular/clustermanagement/templates',
                        to: 'js/angular/clustermanagement/templates',
                        transform: replaceVersion
                    },
                    {
                        from: 'packages/legacy-workbench/src/js/angular/core/templates',
                        to: 'js/angular/core/templates',
                        transform: replaceVersion
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
                      from: 'packages/legacy-workbench/src/js/angular/core/directives/shuttle-multiselect/templates',
                      to: 'js/angular/core/directives/shuttle-multiselect/templates',
                      transform: replaceVersion
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
                        from: 'packages/legacy-workbench/src/js/angular/core/directives/inline-editable-text/templates',
                        to: 'js/angular/core/directives/inline-editable-text/templates',
                        transform: replaceVersion
                    },
                    {
                        from: 'packages/legacy-workbench/src/js/angular/core/components/export-settings-modal',
                        to: 'js/angular/core/components/export-settings-modal',
                        transform: replaceVersion
                    },
                    {
                      from: 'packages/legacy-workbench/src/js/angular/graphql/templates',
                      to: 'js/angular/graphql/templates',
                      transform: replaceVersion
                    },
                    {
                      from: 'packages/legacy-workbench/src/js/angular/core/directives/graphql-playground/templates',
                      to: 'js/angular/core/directives/graphql-playground/templates',
                      transform: replaceVersion
                    },
                    {
                      from: 'packages/legacy-workbench/node_modules/ontotext-graphql-playground-component/dist/ontotext-graphql-playground-component/assets',
                      to: 'assets'
                    },
                    {
                      from: 'packages/legacy-workbench/src/js/angular/core/directives/dynamic-form/templates',
                      to: 'js/angular/core/directives/dynamic-form/templates',
                      transform: replaceVersion
                    },
                    {
                      from: 'packages/legacy-workbench/src/js/angular/core/directives/multiselect-dropdown/templates',
                      to: 'js/angular/core/directives/multiselect-dropdown/templates',
                      transform: replaceVersion
                    },
                    {
                        from: 'packages/legacy-workbench/src/js/angular/templates',
                        to: 'js/angular/templates'
                    },
                    {
                      from: 'packages/legacy-workbench/src/js/angular/guides/templates',
                      to: 'js/angular/guides/templates'
                    },
                    {
                        from: 'license-checker/license-checker-static.json',
                        to: ''
                    },
                    {
                        from: 'packages/root-config/node_modules/regenerator-runtime/runtime.js',
                        to: 'resources'
                    }
                    ,
                    {
                        from: 'node_modules/import-map-overrides/dist/import-map-overrides.js',
                        to: 'resources'
                    },
                    {
                        from: 'node_modules/@single-spa/import-map-injector/lib/import-map-injector.js',
                        to: 'resources'
                    }
                ]
            })
        ],
        module: {
            rules: [
                {
                  test: /\.js$/,
                  exclude: /node_modules/,
                  use: {
                    loader: 'babel-loader'
                  }
                },
                {
                  test: /\.mjs$/,
                  include: /node_modules/,
                  type: 'javascript/auto'
                },
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
                  test: /\.css$/,
                  use: ['style-loader', 'css-loader']
                },
                {
                  test: /\.less$/,
                  use: ['style-loader', 'css-loader', 'less-loader']
                },
                {
                  test: /\.scss$/,
                  use: ['style-loader', 'css-loader', 'sass-loader']
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
                                sources: {
                                    list: [
                                        {
                                            tag: 'img',
                                            attribute: 'src',
                                            type: 'src'
                                        },
                                        {
                                            tag: 'object',
                                            attribute: 'data',
                                            type: 'src'
                                        },
                                        {
                                            tag: 'use',
                                            attribute: 'href',
                                            type: 'src'
                                        }
                                    ]
                                }
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
