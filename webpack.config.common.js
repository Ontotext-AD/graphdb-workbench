const PACKAGE = require('./package.json');
const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
const MergeIntoSingleFilePlugin = require('webpack-merge-and-include-globally');
const WebpackAutoInject = require('webpack-auto-inject-version');

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
        extensions: ['.js']
    },
    plugins: [
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
                from: 'node_modules/font-awesome/css',
                to: 'font/font-awesome/4.3.0/css'
            },
            {
                from: 'node_modules/font-awesome/fonts',
                to: 'font/font-awesome/4.3.0/fonts'
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
                from: 'src/js/angular/chatgpt/templates',
                to: 'js/angular/chatgpt/templates'
            },
            {
                from: 'src/js/angular/clustermanagement/templates',
                to: 'js/angular/clustermanagement/templates'
            },
            {
                from: 'src/js/angular/core/templates',
                to: 'js/angular/core/templates'
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
                from: 'src/js/angular/export/templates',
                to: 'js/angular/export/templates'
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
                from: 'src/js/angular/templates',
                to: 'js/angular/templates'
            }
        ])
    ],
    module: {
        rules: [
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
                        outputPath: 'res/swagger/fonts'
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
