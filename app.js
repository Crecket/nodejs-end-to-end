"use strict";
// CryptoJS library
var CryptoJS = require("crypto-js");

// is library, used for assertions
const is = require('@pwn/is');

// Generic crypto
var crypto = require('crypto');

// system info
var os = require('os');

// System library used to open files
var fs = require('fs');

// Ejs for template rendering
var ejs = require('ejs');

// Express for serving files
var express = require('express');

// helmet is used to ensure HSTS
var helmet = require('helmet');

// Express app
var app = express();

// RSA encryption
var NodeRSA = require('node-rsa');

// Bcrypt support
var bcrypt = require('bcrypt');

// jwt tokens
var jwt = require('jsonwebtoken');

// Load app-vars
var config = require('./src/server/configs/config');

// Load user management
var userManagement = require('./src/server/user_management');

// load initial users
userManagement.users.loadUsers();

// start servertime
var serverTime = Math.floor(Date.now() / 1000);

// start the express server using either the online or offline settings
var https = require('https');
var server = https.createServer(config.sslOptions, app);
console.log('Server started over https for host: ' + os.hostname().trim());

// Retrieve the server's rsa keys
var RSAPrivateKey = fs.readFileSync('src/server/certs/rsa.key') + '';
var RSAPrivateKeyBits = new NodeRSA(RSAPrivateKey, 'private');
var RSAPublicKey = fs.readFileSync('src/server/certs/rsa.crt') + '';
var RSAPublicKeyBits = new NodeRSA(RSAPublicKey, 'public');

// Start the Socket.IO app
var io = require('socket.io').listen(server);

// Express start listening on port
server.listen(config.port);
console.log('Express started at port: ' + config.port);

// TODO modular setup instead of lazy fs-includes
// Express
eval(fs.readFileSync('./src/server/express.js') + '');

// Io connection listener
eval(fs.readFileSync('./src/server/sockets.js') + '');

