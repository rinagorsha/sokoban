'use strict'

const path = require('path');
const webpack = require('webpack');
const autoprefixer = require('autoprefixer-stylus');

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

	devtool: 'source-map',

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
				use: [{
					loader: 'file-loader',
					options: {
						name: '[path][name].html',
						context: 'src/pug/',
					}
				},
				{
					loader: 'pug-html-loader',
					options: {
						pretty: true
					}
				}]
			},
			
			{
				test: /\.(styl|stylus)$/,
				exclude: /node_modules/,
				use: [{
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
					options: {
						sourceMap: true,
					},
				},
				
				{
					loader: 'stylus-loader',
					options: {
						compress: false,
						use: [autoprefixer({browsers: ['> 1%', 'ie > 9', 'iOS > 6'], hideWarnings: true})],
					},
				}],
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
	],

	devServer: {
		contentBase: path.resolve(__dirname, 'dist'),
		publicPath: '/',
		host: '0.0.0.0',
		port: 3000,
		disableHostCheck: true,
		useLocalIp: true,
		compress: true,
		open: true,
		openPage: 'index.html',
		stats: 'errors-only'
	}
};