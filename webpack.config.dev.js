const path = require('path');
const merge = require('webpack-merge');
const commonConfig = require('./webpack.config.common');
const {CleanWebpackPlugin} = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = merge(commonConfig, {
    mode: 'development',
    devtool: 'source-map',
    // devtool: 'none',
    output: {
        filename: '[name].bundle.js',
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
        contentBase: path.join(__dirname, 'dist/'),
        compress: true,
        port: 9000,
        historyApiFallback: true,
        proxy: [{
            context: ['/rest', '/repositories', '/orefine', '/protocol'],
            target: 'http://localhost:7200'
        }]
    }
});
