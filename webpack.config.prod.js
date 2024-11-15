const path = require('path');
const {merge} = require('webpack-merge');
const commonConfig = require('./webpack.config.common');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const {CleanWebpackPlugin} = require('clean-webpack-plugin');
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");

module.exports = (env, argv) => merge(commonConfig(env, argv), {
    mode: 'production',
    performance: {
        maxEntrypointSize: 990000,
        maxAssetSize: 990000,
        assetFilter: function(assetFilename) {
            return !assetFilename.endsWith('swagger-ui.js');
        }
    },
    output: {
        filename: '[name].[contenthash].js',
        chunkFilename: '[name].[contenthash].bundle.js',
        path: path.resolve(__dirname, 'dist'),
        libraryTarget: "system",
        publicPath: '/'
    },
    module: {
        rules: [
            {
                test: /\.css$/,
                use: [{
                    loader: MiniCssExtractPlugin.loader,
                    options: {
                        publicPath: '',
                    },
                }, 'css-loader']
            },
            {
                test: /\.less$/,
                use: [{
                    loader: MiniCssExtractPlugin.loader,
                    options: {
                        publicPath: '',
                    },
                }, 'css-loader', 'less-loader']
            }
        ]
    },
    optimization: {
        minimizer: [
            new CssMinimizerPlugin()
        ]
    },
    plugins: [
        new CopyPlugin({
            patterns: [
                {
                    from: 'packages/root-config/node_modules/systemjs/dist/system.min.js',
                    to: 'resources'
                },
                {
                    from: 'packages/root-config/node_modules/systemjs/dist/extras/amd.min.js',
                    to: 'resources'
                },
                {
                    from: 'packages/root-config/node_modules/single-spa/lib/system/single-spa.min.js',
                    to: 'resources'
                }]
        }),
        new MiniCssExtractPlugin({filename: "[name].[contenthash].css"}),
        new CssMinimizerPlugin(),
        new CleanWebpackPlugin()
    ]
});
