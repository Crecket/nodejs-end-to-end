var webpack = require('webpack');
var path = require('path');

var BUILD_DIR = path.resolve(__dirname, 'app/dist');
var SRC_DIR = path.resolve(__dirname, 'src');

var config = {
    entry: [
        SRC_DIR + '/chat-app.jsx'
    ],
    output: {
        path: BUILD_DIR,
        filename: '[name]bundle.js'
    },
    resolve: {
        modulesDirectories: ["web_modules", "node_modules", "bower_components"]
    },
    plugins: [
        new webpack.HotModuleReplacementPlugin(),
        new webpack.optimize.UglifyJsPlugin()
    ],
    module: {
        loaders: [
            {
                test: /\.jsx?/,
                include: SRC_DIR,
                loaders: ['babel-loader']
            },
            {
                test: /\.css$/,
                include: SRC_DIR,
                loader: "style-loader!css-loader"
            }
        ]
    }
};

module.exports = config;