const path = require('path');
const merge = require('webpack-merge');
const commonConfig = require('./webpack.config.common');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const {CleanWebpackPlugin} = require('clean-webpack-plugin');
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = merge(commonConfig, {
    mode: 'production',
    output: {
        filename: '[name].[contentHash].bundle.js',
        path: path.resolve(__dirname, 'dist')
    },
    module: {
        rules: [
            {
                test: /\.css$/,
                use: [MiniCssExtractPlugin.loader, 'css-loader']
            },
            {
                test: /\.less$/,
                use: [MiniCssExtractPlugin.loader, 'css-loader', 'less-loader']
            }
        ]
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: './src/template.html',
            favicon: 'src/img/icon.png',
            // TODO: enable this once completed with the fixes
            // minify: {
            //     removeAttributeQuotes: true,
            //     collapseWhitespace: true,
            //     removeComments: true
            // }
        }),
        new MiniCssExtractPlugin({filename: "[name].[contentHash].css"}),
        new OptimizeCssAssetsPlugin(),
        new CleanWebpackPlugin()
    ]
});
