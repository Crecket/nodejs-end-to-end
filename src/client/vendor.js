// window.NodeRSA = require('script!../../node_modules/node-rsa/src/NodeRSA.js');
require('raw-loader!../../node_modules/jquery/dist/jquery.min.js');
require('raw-loader!../../node_modules/socket.io-client/dist/socket.io.js');

require('file-loader?name=[name].[ext]!./js/Utils.js');

require('style!./css/style.css');