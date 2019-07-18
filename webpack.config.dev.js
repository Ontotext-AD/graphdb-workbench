var path = require('path');

module.exports = {
  entry: './src/app.js',

  resolve: {
    modules: [
      'src/js/',
      'node_modules'
    ],
    extensions: ['.js']
  },

  devServer: {
    contentBase: path.join(__dirname, 'src/'),
    compress: true,
    port: 9000,
    historyApiFallback: true,
    proxy: [{
      context: ['/rest', '/repositories', '/orefine', '/protocol'],
      target: 'http://localhost:7200'
    }]
  }
};