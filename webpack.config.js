var webpack = require('webpack');
var path = require('path');

var BUILD_DIR = path.resolve(__dirname, 'app/dist');
var SRC_DIR = path.resolve(__dirname, 'src');

var config = {
    entry: [
        SRC_DIR + '/react-app.jsx'
    ],
    output: {
        path: BUILD_DIR,
        filename: 'react-app.js'
    },
    resolve: {
        extensions: ['', '.jsx', '.scss', '.js', '.json'],  // along the way, subsequent file(s) to be consumed by webpack
        modulesDirectories: [
            'node_modules',
            path.resolve(__dirname, './node_modules')
        ]
    },
    plugins: [
        new webpack.ProvidePlugin({
            $: "jquery",
            jQuery: "jquery",
            "window.jQuery": "jquery",
            NodeRSA: "node-rsa"
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
                loader: 'style!css?modules',
                include: /flexboxgrid/,
            }
        ]
    }
};

module.exports = config;
