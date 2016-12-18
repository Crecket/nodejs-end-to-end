require('script-loader!../../node_modules/jquery/dist/jquery.min.js');
// require('script-loader!../../node_modules/socket.io-client/dist/socket.io.js');

require('script-loader!../../bower_components/cryptojslib/components/core.js');
require('script-loader!../../bower_components/cryptojslib/components/hmac.js');
require('script-loader!../../bower_components/cryptojslib/components/md5.js');
require('script-loader!../../bower_components/cryptojslib/components/sha1.js');
require('script-loader!../../bower_components/cryptojslib/components/sha256.js');
require('script-loader!../../bower_components/cryptojslib/rollups/aes.js');
require('script-loader!../../bower_components/cryptojslib/rollups/sha512.js');
require('script-loader!../../bower_components/cryptojslib/components/enc-base64.js');
require('script-loader!../../bower_components/cryptojslib/components/enc-base64.js');

require('script-loader!./js/node-bundle.js');
require('script-loader!./js/Utils.js');
require('script-loader!./js/ConnectionHelper.js');
require('script-loader!./js/CryptoHelper.js');
require('script-loader!./js/Client.js');

require('style!./css/style.css');