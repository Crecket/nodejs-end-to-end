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
                loader: 'babel-loader',
                include: SRC_DIR,
                exclude: /node_modules/,
                query: {
                    presets: ['es2015', 'react']
                }
            }, {
                test: /\.json$/,
                loader: 'json-loader'
            }
        ]
    }
};

module.exports = config;
