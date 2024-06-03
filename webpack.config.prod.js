const PACKAGE = require('./package.json');
const path = require('path');
const merge = require('webpack-merge');
const commonConfig = require('./webpack.config.common');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const {CleanWebpackPlugin} = require('clean-webpack-plugin');
// const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = merge(commonConfig, {
    mode: 'production',
    performance: {
        maxEntrypointSize: 990000,
        maxAssetSize: 990000,
        assetFilter: function(assetFilename) {
            return !assetFilename.endsWith('swagger-ui.js');
        }
    },
    output: {
        filename: '[name].[contentHash].bundle.js',
        chunkFilename: '[name].[contentHash].bundle.js',
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
    optimization: {
        minimizer: [
            new CssMinimizerPlugin()
        ]
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: './src/template.html',
            favicon: 'src/img/icon.png',
            templateParameters: {
                version: PACKAGE.version
            }
            // TODO: enable this once completed with the fixes
            // minify: {
            //     removeAttributeQuotes: true,
            //     collapseWhitespace: true,
            //     removeComments: true
            // }
        }),
        new MiniCssExtractPlugin({filename: "[name].[contentHash].css"}),
        // new OptimizeCssAssetsPlugin(),
        new CssMinimizerPlugin(),
        new CleanWebpackPlugin()
    ]
});
