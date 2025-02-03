const PACKAGE = require('./package.json');
const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
const MergeIntoSingleFilePlugin = require('webpack-merge-and-include-globally');
const WebpackAutoInject = require('webpack-auto-inject-version');
const webpack = require('webpack');
const fs = require('fs');

// Load the languages JSON file as a string for injection
const languagesConfig = JSON.stringify(
    JSON.parse(fs.readFileSync(path.resolve(__dirname, 'src/i18n/languages.json'), 'utf8'))
);

// Pass this function as a transform argument to CopyPlugin elements to replace [AIV]{version}[/AIV]
// with the current workbench version number. This is not related to the WebpackAutoInject plugin
// (it will replace only in bundled files, not in CopyPlugin) but we use the same tag for consistency.
function replaceVersion(content) {
    return content
        .toString()
        .replace(/\[AIV]{version}\[\/AIV]/g, PACKAGE.version);
}

module.exports = {
    entry: {
        vendor: './src/vendor.js',
        main: './src/main.js',
        bundle: './src/app.js'
    },
    output: {
        filename: '[name].js',
        chunkFilename: '[name].js',
        path: path.resolve(__dirname, 'dist')
    },
    resolve: {
        modules: [
            'src/js/',
            'node_modules'
        ],
        extensions: ['.js', '.mjs']
    },
    plugins: [
        new webpack.DefinePlugin({
            __LANGUAGES__: languagesConfig
        }),
        new WebpackAutoInject({
            SILENT: true,
            components: {
                AutoIncreaseVersion: false,
                InjectAsComment: false
            }
        }),
        new MergeIntoSingleFilePlugin({
            files: {
                "plugins.js": [
                    'src/**/plugin.js'
                ]
            }
        }),
        new CopyPlugin([
            {
                from: 'src/js/angular/plugin-registry.js',
                to: 'plugin-registry.js'
            },
            {
                from: 'node_modules/angularjs-slider/dist/rzslider.min.css',
                to: 'js/lib/rzslider/rzslider.min.css'
            },
            {
                from: 'src/js/lib/angucomplete-alt/angucomplete-alt.css',
                to: 'js/lib/angucomplete-alt/angucomplete-alt.css'
            },
            {
                from: 'src/js/lib/d3-tip/d3-tip.css',
                to: 'js/lib/d3-tip/d3-tip.css'
            },
            {
                from: 'src/js/angular/templates/loader/ot-loader.svg',
                to: 'js/angular/templates/loader/ot-loader.svg'
            },
            {
                from: 'node_modules/ng-tags-input/build/ng-tags-input.min.css',
                to: 'css/lib/ng-tags-input/ng-tags-input.min.css'
            },
            {
                from: 'node_modules/angular-xeditable/dist/css/xeditable.min.css',
                to: 'css/lib/angular-xeditable/xeditable.min.css'
            },
            {
                from: 'src/js/lib/bootstrap/bootstrap.min.css',
                to: 'js/lib/bootstrap/bootstrap.min.css'
            },
            {
                from: 'src/css',
                to: 'css'
            },
            {
                from: 'src/res',
                to: 'res',
                transform: replaceVersion
            },
            {
                from: 'src/pages',
                to: 'pages',
                transform: replaceVersion
            },
            {
                from: 'src/i18n',
                to: 'i18n'
            },
            {
                from: 'src/js/angular/repositories/templates',
                to: 'js/angular/repositories/templates'
            },
            {
                from: 'src/js/angular/autocomplete/templates',
                to: 'js/angular/autocomplete/templates'
            },
            {
                from: 'src/js/angular/ttyg/templates',
                to: 'js/angular/ttyg/templates',
                transform: replaceVersion
            },
            {
                from: 'src/js/angular/clustermanagement/templates',
                to: 'js/angular/clustermanagement/templates'
            },
            {
                from: 'src/js/angular/core/templates',
                to: 'js/angular/core/templates',
                transform: replaceVersion
            },
            {
                from: 'src/js/angular/explore/templates',
                to: 'js/angular/explore/templates'
            },
            {
                from: 'src/js/angular/externalsync/templates',
                to: 'js/angular/externalsync/templates'
            },
            {
                from: 'src/js/angular/graphexplore/templates',
                to: 'js/angular/graphexplore/templates'
            },
            {
                from: 'src/js/angular/import/templates',
                to: 'js/angular/import/templates'
            },
            {
                from: 'src/js/angular/rdfrank/templates',
                to: 'js/angular/rdfrank/templates'
            },
            {
                from: 'src/js/angular/security/templates',
                to: 'js/angular/security/templates',
                transform: replaceVersion
            },
            {
                from: 'src/js/angular/settings/modal',
                to: 'js/angular/settings/modal'
            },
            {
                from: 'src/js/angular/core/directives/shuttle-multiselect/templates',
                to: 'js/angular/core/directives/shuttle-multiselect/templates',
                transform: replaceVersion
            },
            {
                from: 'src/js/angular/core/directives/rdfresourcesearch/templates',
                to: 'js/angular/core/directives/rdfresourcesearch/templates',
                transform: replaceVersion
            },
            {
                from: 'src/js/angular/core/directives/languageselector/templates',
                to: 'js/angular/core/directives/languageselector/templates',
                transform: replaceVersion
            },
            {
                from: 'src/js/angular/core/directives/operations-statuses-monitor/templates',
                to: 'js/angular/core/directives/operations-statuses-monitor/templates',
                transform: replaceVersion
            },
            {
                from: 'src/js/angular/core/directives/autocomplete/templates',
                to: 'js/angular/core/directives/autocomplete/templates',
                transform: replaceVersion
            },
            {
                from: 'src/js/angular/core/directives/yasgui-component/templates',
                to: 'js/angular/core/directives/yasgui-component/templates',
                transform: replaceVersion
            },
            {
                from: 'src/js/angular/core/directives/inline-editable-text/templates',
                to: 'js/angular/core/directives/inline-editable-text/templates',
                transform: replaceVersion
            },
            {
                from: 'src/js/angular/core/components/export-settings-modal',
                to: 'js/angular/core/components/export-settings-modal',
                transform: replaceVersion
            },
            {
                from: 'src/js/angular/graphql/templates',
                to: 'js/angular/graphql/templates',
                transform: replaceVersion
            },
            {
                from: 'src/js/angular/core/directives/graphql-playground/templates',
                to: 'js/angular/core/directives/graphql-playground/templates',
                transform: replaceVersion
            },
            {
                from: 'src/js/angular/core/directives/dynamic-form/templates',
                to: 'js/angular/core/directives/dynamic-form/templates',
                transform: replaceVersion
            },
            {
                from: 'src/js/angular/core/directives/multiselect-dropdown/templates',
                to: 'js/angular/core/directives/multiselect-dropdown/templates',
                transform: replaceVersion
            },
            {
                from: 'src/js/angular/templates',
                to: 'js/angular/templates'
            },
            {
                from: 'node_modules/ontotext-graphql-playground-component/dist/ontotext-graphql-playground-component/assets',
                to: 'assets'
            }
        ])
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
                test: /jquery.js/,
                use: [
                    {
                        loader: 'expose-loader',
                        options: 'jQuery'
                    },
                    {
                        loader: 'expose-loader',
                        options: '$'
                    }
                ]
            },
            {
                test: /d3.js/,
                use: [
                    {
                        loader: 'expose-loader',
                        options: 'd3'
                    }
                ]
            },
            {
                test: /\.html$/,
                // Stacking html-loader to replace the image URLs, then extract-loader to extract
                // the HTML and finally ejs-loader so that variables can be replaced via
                // HtmlWebpackPlugin's templateParameters.
                use: [{
                    loader: 'ejs-loader',
                    options: {
                        esModule: false
                    }
                }, {
                    loader: 'extract-loader'
                }, {
                    loader: 'html-loader',
                    options: {
                        attrs: ['img:src', 'object:data', 'use:href']
                    }
                }]
            },
            {
                test: /\.(svg|png|jpg|gif)$/,
                use: {
                    loader: 'file-loader',
                    options: {
                        name: '[name].[hash].[ext]',
                        outputPath: 'img'
                    }
                }
            },
            {
                test: /\.woff(2)?(\?v=\d+\.\d+\.\d+)?$/,
                use: {
                    loader: "file-loader",
                    options: {
                        name: '[name].[ext]',
                        outputPath: 'res/swagger5/fonts'
                    }
                }
            }, {
                test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/,
                use: {
                    loader: "url-loader?mimetype=application/octet-stream",
                    options: {
                        name: '[name].[hash].[ext]',
                        outputPath: 'font'
                    }
                }
            }, {
                test: /\.eot(\?v=\d+\.\d+\.\d+)?$/,
                use: {
                    loader: "file-loader",
                    options: {
                        name: '[name].[hash].[ext]',
                        outputPath: 'font'
                    }
                }
            }, {
                test: /\.(png|jpg|jpeg|gif)$/,
                loader: 'url-loader'
            },
            {
                test: /\.(ttl|ttls|trig|trigs)$/,
                loader: 'url-loader'
            }
        ]
    }
};
