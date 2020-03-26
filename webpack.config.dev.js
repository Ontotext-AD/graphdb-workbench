const path = require('path');
const merge = require('webpack-merge');
const commonConfig = require('./webpack.config.common');
const {CleanWebpackPlugin} = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const host = 'lom.int.ontotext.com';
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
            favicon: 'src/img/icon.png'
        }),
        new CleanWebpackPlugin()
    ],
    devServer: {
    //    disableHostCheck: true,
        contentBase: path.join(__dirname, 'dist/'),
        compress: true,
        port: portHere,
        host: host,
        historyApiFallback: true,
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
