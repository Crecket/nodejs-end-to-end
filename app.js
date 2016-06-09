// libraries
// CryptoJS library
var CryptoJS = require("crypto-js");

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
// var user_management = require('./src/server/user_management');

// stored user accounts
var userDatabaseList = {};

// active clients
var userList = {};

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
eval(fs.readFileSync('./src/server/express.js')+'');

// Io connection listener
eval(fs.readFileSync('./src/server/sockets.js')+'');

// Set username public key
// param2: key as plain text
function setUserKeys(username, keys) {
    if (keys) {
        var tempKey = new NodeRSA(keys.publicKey, 'public');
        var tempKeySign = new NodeRSA(keys.publicKeySign, 'public');

        if (tempKey.isPublic() && tempKeySign.isPublic()) {
            userList[username]['public_key'] = tempKey.exportKey('public');
            userList[username]['public_key_sign'] = tempKeySign.exportKey('public');
            return true;
        }
    }
    return false;
}

// Add user to userlist
function addUser(userName, socketId, ip) {
    userList[userName] = {
        'username': userName,
        'public_key': false,
        'socketId': socketId,
        'allow_files': false,
        'ip': ip,
        'last_activity': new Date()
    };
}

// Remove user from userlist
function removeUser(userName) {
    delete userList[userName];
}

function refreshUser(userName) {
    userList[userName]['last_activity'] = new Date();
}

// Encrypt with private key
function rsaEncrypt(data) {
    return RSAPublicKeyBits.encrypt(data, 'base64');
}

// Decrypt with public key
function rsaDecrypt(data) {
    return RSAPrivateKeyBits.decrypt(data, 'utf8', 'base64');
}

// Random 128 byte token
function randomToken() {
    return crypto.randomBytes(128).toString('hex');
}

function sendServerInfo() {
    var tempArray = {};
    serverTime = Math.floor(Date.now() / 1000);

    // Selective data sending
    for (var key in userList) {
        tempArray[key] = {};
        tempArray[key]['username'] = userList[key]['username'];
        tempArray[key]['public_key'] = userList[key]['public_key'];
        tempArray[key]['public_key_sign'] = userList[key]['public_key_sign'];
    }

    // send to client
    io.emit('server_info', {
        'user_list': tempArray,
        'publicKey': RSAPublicKey,
        'time': serverTime
    });
}

// add a new user to the user list
function addDatabaseUser(username, password, callback) {
    // check if user already exists
    if (!userList[username.toLowerCase()]) {

        // salt to use in the client
        var clientSalt = randomToken();

        // hash that the client would generate
        var clientHash = CryptoJS.enc.Hex.stringify(CryptoJS.SHA512(password + clientSalt));

        // hash the password with bcrypt
        bcrypt.genSalt(11, function (err, salt) {
            bcrypt.hash(clientHash, salt, function (err, hash) {
                if (!err && hash) {
                    // store in the userlist array
                    userDatabaseList[username.toLowerCase()] = {
                        username: username,
                        password: hash,
                        salt: clientSalt
                    };

                    // store the new list in json
                    saveDatabaseUsers();

                    // callback
                    callback(true);
                    return true;
                }
            });
        });
    }
}

// load the user list from the config
function loadDatabaseUsers() {
    try {
        var data = fs.readFileSync('./src/server/configs/users.json');
        userDatabaseList = JSON.parse(data);
    }
    catch (err) {
        console.log('Server failed to load and parse the user list from the config.')
        console.log(err);
    }
}

// store the user list to the config file
function saveDatabaseUsers() {
    var stringified = JSON.stringify(userDatabaseList);
    fs.writeFile('./src/server/configs/users.json', stringified, function (err) {
        if (err) {
            console.log('Server failed to save the user list to the config file.');
            console.log(err.message);
            return;
        }
    });
}

loadDatabaseUsers();

// Server custom heartbeat, send basic information to the client every second
setInterval(sendServerInfo, 1000);