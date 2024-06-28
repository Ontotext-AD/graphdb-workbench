const PACKAGE = require('./package.json');
const path = require('path');
const {merge} = require('webpack-merge');
const commonConfig = require('./webpack.config.common');
const {CleanWebpackPlugin} = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const host = 'localhost';
const portHere = 9001;
const portThere = 7200;

module.exports = merge(commonConfig, {
    mode: 'development',
    devtool: 'source-map',
    output: {
        filename: '[name].bundle.js',
        chunkFilename: '[name].bundle.js',
        path: path.resolve(__dirname, 'dist')
    },
    module: {
        rules: [
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
            template: './src/template.html',
            favicon: 'src/img/icon.png',
            showErrors: true,
            templateParameters: {
                version: PACKAGE.version,
                devMode: true
            }
        }),
        new CleanWebpackPlugin()
    ],
    devServer: {
        // disableHostCheck: true,
        allowedHosts: 'all',
        // contentBase: path.join(__dirname, 'dist/'),
        static: {
            directory: path.join(__dirname, 'dist/')
        },
        compress: true,
        port: portHere,
        host: host,
        headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
            "Access-Control-Allow-Headers": "X-Requested-With, content-type, Authorization, x-graphdb-repository",
        },
        // needed to handle urls sent by open id providers that contain dots
        historyApiFallback: {
            disableDotRule: true
        },
        proxy: [{
            context: ['/rest', '/repositories', '/protocol', '/rdf-bridge'],
            target: 'http://' + host + ':' + portThere,
            onProxyRes: (proxyRes) => {
                var key = 'www-authenticate';
                if (proxyRes.headers[key]) {
                    proxyRes.headers[key] = proxyRes.headers[key].split(', ');
                }
            }
        }]
    }
});
