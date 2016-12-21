var webpack = require('webpack');
var path = require('path');
var ExtractTextPlugin = require("extract-text-webpack-plugin");

// env variable check
var DEV = process.env.NODE_ENV !== "production";

var BUILD_DIR = path.resolve(__dirname, 'app/dist');
var SRC_DIR = path.resolve(__dirname, 'src');

console.log('Running webpack in: ' + process.env.NODE_ENV);

var config = {
    entry: {
        app: SRC_DIR + '/client/react-app.jsx',
        vendor: SRC_DIR + '/client/vendor.js'
    },
    output: {
        path: BUILD_DIR,
        filename: '[name].js'
    },
    resolve: {
        extensions: ['', '.jsx', '.scss', '.js', '.json'],  // along the way, subsequent file(s) to be consumed by webpack
        modulesDirectories: [
            'node_modules',
            path.resolve(__dirname, './node_modules')
        ]
    },
    plugins: [
        new webpack.DefinePlugin({
            'process.env': {
                NODE_ENV: JSON.stringify(process.env.NODE_ENV)
            }
        }),
        new ExtractTextPlugin("[name].css", {
            allChunks: true
        }),
        //Allows error warnings but does not stop compiling. Will remove when eslint is added
        new webpack.NoErrorsPlugin()
    ],
    module: {
        loaders: [
            {
                test: /\.jsx?$/,
                loaders: ['babel-loader'],
                include: SRC_DIR,
                exclude: /node_modules/
            }, {
                test: /\.json$/,
                loader: 'json-loader'
            }, {
                test: /\.css$/,
                loader: ExtractTextPlugin.extract("style-loader", "css-loader")
            }, {
                test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
                loader: "url-loader?limit=10000&mimetype=application/font-woff"
            }, {
                test: /\.(ttf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
                loader: "file-loader"
            }
        ]
    }
};

if (!DEV) {
    // In production mode add the uglify plugin
    config.plugins.push(new webpack.optimize.UglifyJsPlugin({
        compress: {
            warnings: false
        }
    }))
}

module.exports = config;
