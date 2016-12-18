// window.NodeRSA = require('script!../../node_modules/node-rsa/src/NodeRSA.js');
require('raw-loader!../../node_modules/jquery/dist/jquery.min.js');
require('raw-loader!../../node_modules/socket.io-client/dist/socket.io.js');

require('raw-loader!./js/CryptoJS/components/core.js');
require('raw-loader!./js/CryptoJS/components/hmac.js');
require('raw-loader!./js/CryptoJS/components/md5.js');
require('raw-loader!./js/CryptoJS/components/sha1.js');
require('raw-loader!./js/CryptoJS/components/sha256.js');
require('raw-loader!./js/CryptoJS/rollups/aes.js');
require('raw-loader!./js/CryptoJS/rollups/sha512.js');
require('raw-loader!./js/CryptoJS/components/enc-base64.js');
require('raw-loader!./js/CryptoJS/components/enc-base64.js');

// require('file-loader?name=[name].[ext]!./js/node-bundle.js');
require('file-loader?name=[name].[ext]!./js/Utils.js');
// require('file-loader?name=[name].[ext]!./js/ConnectionHelper.js');
// require('file-loader?name=[name].[ext]!./js/CryptoHelper.js');
// require('file-loader?name=[name].[ext]!./js/Client.js');

require('style!./css/style.css');