// Packages
const webpack = require('webpack'),
      path = require('path');

// Webpack Plugins
const CopyPlugin = require('copy-webpack-plugin');

// Paths
const src = path.join(__dirname, 'src'),
      dist = path.join(__dirname, 'build');

module.exports = {
  resolve: {
    alias: {
      src,
    }
  },
  context: src,
  entry: {
    admin: './admin/',
    index: './index.js'
  },
  output: {
    path: dist,
    filename: 'js/[name].js'
  },

  module: {},

  plugins: [
    new CopyPlugin([
      '**/*.html',
    ])
  ],

  devtool: '#inline-cheap-source-map'
}
