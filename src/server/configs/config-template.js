var os = require('os');
var fs = require('fs');

var config = {};

// port that the express server will be using
config.port = 8888;

// This is optional and is used to check whether the server is running on a local or online source
config.onlineHostName = "CrecketMe";
config.sslOptions = {};

// location of the database
config.database_location = __dirname + '/../data/database.db';

// check if online host name is found
if (os.hostname().trim() === config.onlineHostName) {
    // online settings, we also need to supply the ca certificate chain
    config.sslOptions = {
        key: fs.readFileSync('/etc/letsencrypt/live/example.com/privkey.pem', 'utf8'),
        cert: fs.readFileSync('/etc/letsencrypt/live/example.com/cert.pem', 'utf8'),
        // ca is required in most cases or some devices will decline the ssl certificate
        ca: [fs.readFileSync('/etc/letsencrypt/live/example.com/fullchain.pem')],
        ciphers: ["ECDHE-RSA-AES256-SHA384", "DHE-RSA-AES256-SHA384", "ECDHE-RSA-AES256-SHA256", "DHE-RSA-AES256-SHA256", "ECDHE-RSA-AES128-SHA256", "DHE-RSA-AES128-SHA256", "HIGH", "!aNULL", "!eNULL", "!EXPORT", "!DES", "!RC4", "!MD5", "!PSK", "!SRP", "!CAMELLIA"].join(':'),
        honorCipherOrder: true,
        requestCert: false
    };
} else {
    // local settings, no CA is required since we use self signed certificates
    config.sslOptions = {
        key: fs.readFileSync('src/server/certs/localhost.key'),
        cert: fs.readFileSync('src/server/certs/localhost.crt'),
        ciphers: ["ECDHE-RSA-AES256-SHA384", "DHE-RSA-AES256-SHA384", "ECDHE-RSA-AES256-SHA256", "DHE-RSA-AES256-SHA256", "ECDHE-RSA-AES128-SHA256", "DHE-RSA-AES128-SHA256", "HIGH", "!aNULL", "!eNULL", "!EXPORT", "!DES", "!RC4", "!MD5", "!PSK", "!SRP", "!CAMELLIA"].join(':'),
        honorCipherOrder: true,
        requestCert: false
    };
}

// return as module
module.exports = config;