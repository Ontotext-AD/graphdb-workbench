const path = require("path");
const CleanWebpackPlugin = require("clean-webpack-plugin").CleanWebpackPlugin;

module.exports = (webpackConfigEnv, argv) => {
    return {
        mode: 'development',
        entry: "./src/index.js",
        output: {
            path: path.resolve(process.cwd(), "dist"),
            filename: "index.js",
            libraryTarget: "system",
            publicPath: "",
        },
        resolve: {
            extensions: [".js"],
        },
        plugins: [
            new CleanWebpackPlugin()
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
            port: 9004
        },
        optimization: {
            minimize: false,
        }
    };
};
