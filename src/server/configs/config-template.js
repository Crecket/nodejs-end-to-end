var os = require('os');
var fs = require('fs');

var config = {};

// port that the express server will be using
config.port = 8888;

// This is optional and is used to check whether the server is running on a local or online source
config.onlineHostName = "example.com";
config.sslOptions = {};

// check if online host name is found
if (os.hostname().trim() === config.onlineHostName) {
    config.sslOptions = {
        key: fs.readFileSync('/etc/letsencrypt/live/example.com/privkey.pem'),
        cert: fs.readFileSync('/etc/letsencrypt/live/example.com/cert.pem'),
        // ca is required in most cases or some devices will decline the ssl certificate
        ca: [fs.readFileSync('/etc/letsencrypt/live/example.com/chain.pem')],
        ciphers: [
            "ECDHE-RSA-AES256-SHA384",
            "DHE-RSA-AES256-SHA384",
            "ECDHE-RSA-AES256-SHA256",
            "DHE-RSA-AES256-SHA256",
            "ECDHE-RSA-AES128-SHA256",
            "DHE-RSA-AES128-SHA256",
            "HIGH",
            "!aNULL",
            "!eNULL",
            "!EXPORT",
            "!DES",
            "!RC4",
            "!MD5",
            "!PSK",
            "!SRP",
            "!CAMELLIA"
        ].join(':'),
        honorCipherOrder: true,
        requestCert: false
    };
} else {
    config.sslOptions = {
        key: fs.readFileSync('src/server/certs/example.com.key'),
        cert: fs.readFileSync('src/server/certs/domain.crt'),
        ciphers: [
            "ECDHE-RSA-AES256-SHA384",
            "DHE-RSA-AES256-SHA384",
            "ECDHE-RSA-AES256-SHA256",
            "DHE-RSA-AES256-SHA256",
            "ECDHE-RSA-AES128-SHA256",
            "DHE-RSA-AES128-SHA256",
            "HIGH",
            "!aNULL",
            "!eNULL",
            "!EXPORT",
            "!DES",
            "!RC4",
            "!MD5",
            "!PSK",
            "!SRP",
            "!CAMELLIA"
        ].join(':'),
        honorCipherOrder: true,
        requestCert: false
    };
}

// return as module
module.exports = config;