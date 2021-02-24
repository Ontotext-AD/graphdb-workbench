const PACKAGE = require('./package.json');
const path = require('path');
const merge = require('webpack-merge');
const commonConfig = require('./webpack.config.common');
const {CleanWebpackPlugin} = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const host = 'localhost';
const portHere = 9000;
const portThere = 7200;

module.exports = merge(commonConfig, {
    mode: 'development',
    output: {
        filename: '[name].bundle.js',
        chunkFilename: '[name].bundle.js',
        path: path.resolve(__dirname, 'dist')
    },
    module: {
        rules: [
            {
                // when bundling application's own source code
                // transpile using Babel which uses .babelrc file
                // and instruments code using babel-plugin-istanbul
                test: /\.js/,
                exclude: /(node_modules)/,
                use: [
                    {
                        loader: 'babel-loader'
                    }
                ]
            },
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader']
            },
            {
                test: /\.less$/,
                use: ['style-loader', 'css-loader', 'less-loader']
            }
        ]
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: __dirname + '/src/template.html',
            favicon: __dirname + '/src/img/icon.png',
            templateParameters: {
                version: PACKAGE.version
            }
        }),
        new CleanWebpackPlugin()
    ],
    devServer: {
        disableHostCheck: true,
        contentBase: path.join(__dirname, 'dist/'),
        compress: true,
        port: portHere,
        host: host,
        // needed to handle urls sent by open id providers that contain dots
        historyApiFallback: {
            disableDotRule: true
        },
        proxy: [{
            context: ['/rest', '/repositories', '/orefine', '/protocol', '/rdf-bridge'],
            target: 'http://' + host + ':' + portThere,
            onProxyRes: proxyRes => {
                var key = 'www-authenticate';
                if (proxyRes.headers[key]) {
                    proxyRes.headers[key] = proxyRes.headers[key].split(', ');
                }
            }
        }]
    }
});
