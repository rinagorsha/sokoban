'use strict'

const path = require('path');
const webpack = require('webpack');
const autoprefixer = require('autoprefixer-stylus');
const CleanPlugin = require('clean-webpack-plugin');

const context = path.resolve(__dirname, 'src');

module.exports = {
	context: context,

	entry: [
		'babel-polyfill',
		'./js/index.js',
		'./styl/main.styl',
		'./pug/index.pug',
	],
	output: {
		path: path.resolve(context, '../dist'),
		filename: path.join('js', 'all.js')
	},

	module: {
		rules: [
			{
				test: /\.js$/,
				exclude: [/node_modules/],
				use: [{
					loader: 'babel-loader',
					options: {
						presets: ['stage-0']
					}
				}]
			},
			
			{
				test: /\.(pug|jade)$/,
				exclude: [/node_modules/],
				use: [
					{
						loader: 'file-loader',
						options: {
							name: '[path][name].html',
							context: 'src/pug/',
						}
					}, {
						loader: 'pug-html-loader',
						options: {
							pretty: true
						}
					}
				]
			},
			
			{
				test: /\.(styl|stylus)$/,
				exclude: /node_modules/,
				use: [
					{
						loader: 'file-loader',
						options: {
							name: 'css/all.css',
						},
					},
					{
						loader: 'extract-loader',
						options: {
							publicPath: '../',
						},
					},
					{
						loader: 'css-loader',
					},
					
					{
						loader: 'stylus-loader',
						options: {
							compress: true,
							use: [autoprefixer({browsers: ['> 1%', 'ie > 9', 'iOS > 6'], hideWarnings: true})],
						},
					},
				],
			},

			{
				test: /\.(png|jpg|gif|svg|ico)$/,
				use: {
					loader: 'file-loader',
					options: {
						name: '[path][name].[ext]'
					}
				}
			},
			
			{
				test: /\.(eot|ttf|woff|woff2)$/,
				exclude: /node_modules/,
				use: {
					loader: 'file-loader',
					options: {
						name: '[path][name].[ext]',
						context: 'src/',
					},
				},
			},
		]
	},

	plugins: [
		new webpack.HotModuleReplacementPlugin(),
		new CleanPlugin(['dist/'], {
			root: path.join(context, '../'),
			verbose: true,
			dry: false,
		}),
		new webpack.optimize.UglifyJsPlugin({
			compress: {
				drop_console: true,
				warnings: false,
			},
		}),
	]
};