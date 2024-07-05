const path = require("path");
const CleanWebpackPlugin = require("clean-webpack-plugin").CleanWebpackPlugin;
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = (webpackConfigEnv, argv) => {
    return {
        mode: 'development',
        entry: "./src/navbar.js",
        output: {
            path: path.resolve(process.cwd(), "dist"),
            filename: "navbar.js",
            libraryTarget: "system",
            publicPath: "",
        },
        resolve: {
            extensions: [".js"],
        },
        plugins: [
            new CleanWebpackPlugin(),
            new HtmlWebpackPlugin({
                template: "./src/navbar.html",
            })
        ],
        module: {
            rules: [
                {
                    test: /\.html$/,
                    use: [
                        {
                            loader: "html-loader"
                        },
                    ],
                },
                {
                    test: /\.css$/,
                    use: [
                        'style-loader',
                        'css-loader'
                    ]
                }
            ],
        },
        devServer: {
            static: {
                directory: path.join(__dirname, 'dist/')
            },
            headers: { "Access-Control-Allow-Origin": "*" },
            allowedHosts: "all",
            historyApiFallback: true,
            port: 9005
        }
    };
};
