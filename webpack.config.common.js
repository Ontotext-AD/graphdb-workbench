const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
    entry: {
        vendor: './src/vendor.js',
        main: './src/main.js',
        bundle: './src/app.js'
    },
    resolve: {
        modules: [
            'src/js/',
            'node_modules'
        ],
        extensions: ['.js']
    },
    plugins: [
        new CopyPlugin([
            {
                from: 'src/js/lib/rzslider/rzslider.css',
                to: 'js/lib/rzslider/rzslider.css'
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
                from: 'src/js/lib/ng-tags-input/ng-tags-input.min.css',
                to: 'js/lib/ng-tags-input/ng-tags-input.min.css'
            },
            {
                from: 'src/js/lib/angular-xeditable/0.1.8/xeditable.css',
                to: 'js/lib/angular-xeditable/0.1.8/xeditable.css'
            },
            {
                from: 'src/js/lib/bootstrap-switch/3.2.2/bootstrap-switch.min.css',
                to: 'js/lib/bootstrap-switch/3.2.2/bootstrap-switch.min.css'
            },
            {
                from: 'src/js/lib/nvd3/nv.d3.css',
                to: 'js/lib/nvd3/nv.d3.css'
            },
            {
                from: 'src/css',
                to: 'css'
            },
            {
                from: 'src/res',
                to: 'res'
            },
            {
                from: 'src/pages',
                to: 'pages'
            },
            {
                from: 'src/js/angular/autocomplete/templates',
                to: 'js/angular/autocomplete/templates'
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
                to: 'js/angular/security/templates'
            },
            {
                from: 'src/js/angular/settings/modal',
                to: 'js/angular/settings/modal'
            },
            {
                from: 'src/js/angular/sparql/templates',
                to: 'js/angular/sparql/templates'
            },
            {
                from: 'src/js/angular/templates',
                to: 'js/angular/templates'
            },
        ])
    ],
    module: {
        rules: [
            {
                test: /jquery.min.js/,
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
                test: /\.html$/,
                use: {
                    loader: 'html-loader',
                    options: {
                        attrs: ['img:src', 'object:data']
                    }
                }
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
                test: /\.woff(\?v=\d+\.\d+\.\d+)?$/,
                use: {
                    loader: "url-loader?mimetype=application/font-woff",
                    options: {
                        name: '[name].[hash].[ext]',
                        outputPath: 'font'
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
                test: /\.(png|jpg|jpeg|gif|woff|woff2)$/,
                loader: 'url-loader'
            }
        ]
    }
};
