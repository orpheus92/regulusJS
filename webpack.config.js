const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const webpack = require('webpack');
const path = require('path');

module.exports = {
  entry: {
    main: './src/app/index.js',
    vendor: [
      'd3','d3-tip','d3-shape'//,'d3-selection'
    ]
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].[chunkhash].js',
    libraryTarget: "amd"
  },
  devtool: process.env.NODE_ENV === 'production' ? false : 'inline-source-map',
  devServer: {
    contentBase: './dist'
  },
  module: {
   rules: [
     { test: /\.(txt|cpp)$/, use: 'raw-loader' },
     { test: /\.css$/, use: [ 'style-loader', 'css-loader'] },
     { test: /\.scss$/, use: [ 'cache-loader', 'style-loader', 'css-loader', 'sass-loader'], include: path.resolve('src') },
     { test: /\.(png|svg|jpg|gif)$/,  use: [ 'file-loader'] },
     { test: /\.(woff|woff2|eot|ttf|otf)$/, use: ['file-loader'] },
     { test: /\.(csv|tsv)$/, use: [ 'csv-loader' ] },
     { test: /\.xml$/, use: [ 'xml-loader' ] }
   ]
 },
 plugins: [
  //  new CleanWebpackPlugin(['dist']),
   new HtmlWebpackPlugin({template: './src/app/index.html'}),
  //  new webpack.HashedModuleIdsPlugin(),
   new webpack.optimize.CommonsChunkPlugin({
     name: 'vendor'
   }),
   new webpack.optimize.CommonsChunkPlugin({
     name: 'runtime'
   }),
   //  new webpack.optimize.UglifyJsPlugin(),
 ]
};
