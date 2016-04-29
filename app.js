// CryptoJS library
var CryptoJS = require("crypto-js");

// sjcl library
var sjcl = require("sjcl");

// Generic crypto
var crypto = require('crypto');

// System library used to open files
var fs = require('fs');

// Ejs for template rendering
var ejs = require('ejs');

// Express for serving files
var express = require('express');

// Express app
var app = express();

// Jwt token authentication
var jwt = require('jsonwebtoken');

// RSA encryption
var NodeRSA = require('node-rsa');

// Mysql library
var mysql = require('mysql');

// Bcrypt support
var bcrypt = require('bcrypt');

// Express sessions
var session = require('express-session')

// socket.io listens on port:
var port = 8888;

// Use ssl with self-signed certificates
// generate your own if you use this in production!
var options = {
    key: fs.readFileSync('domain.key'),
    cert: fs.readFileSync('domain.crt'),
    requestCert: false
};
var https = require('https');
var server = https.createServer(options, app);
console.log('Server started over https');


// Load app-vars
eval(fs.readFileSync('app-vars.js') + '');

/*
 A rsa key example is in this repo, make sure to generate your own in production enviroments!
 */
// Load RSA private and public key
var RSAPrivateKey = fs.readFileSync('rsaPrivateKey.key') + '';
var RSAPrivateKeyBits = new NodeRSA(RSAPrivateKey, 'private');

var RSAPublicKey = fs.readFileSync('rsaPublicKey.crt') + '';
var RSAPublicKeyBits = new NodeRSA(RSAPublicKey, 'public');


// Create rsa key example
// var key = new NodeRSA({b: 2048});
//
// var publicDer = key.exportKey('public');
// var privateDer = key.exportKey('private');
//
// console.log('');
// console.log('Public');
// console.log('');
// console.log(publicDer);
// console.log('');
// console.log('Private');
// console.log('');
// console.log(privateDer);
//
// process.exit();

// var test = bcrypt.hashSync("40022382bedf6076837be1c7aa045f12d88320de96bc03c05d75052acb9a3b39", bcrypt.genSaltSync(11));
// console.log(test);

// Create mysql connection
var mysqlConnection = mysql.createConnection('mysql://root:1234@localhost/nodejs_db?debug=false');

// Test mysql connection
mysqlConnection.connect(function (err) {
    if (err !== null) {
        console.log('Mysql error');
        // console.log(err);
        // process.exit(); // Exit proccess
    }
});

// Socket io app
var io = require('socket.io').listen(server);

// send heartbeat every 5 seconds
// io.set('heartbeat interval', 5);
// disconnect client if socket misses 2 heartbeats
// io.set('heartbeat timeout', 11);

// Start listening on port
server.listen(port);

// Express server static files for public folder
console.log('Express started at port: ' + port);

/* ================================================== */
/* ================== SETTINGS ====================== */
/* ================================================== */

// Make express use ejs for rendering views
app.set('view engine', 'ejs');
// trust first proxy
app.set('trust proxy', 1);

// home path
app.get('/', function (req, res, next) {
    res.render('index', {
        'login_screen': ejs.render(getView('login_screen')),
        'chat_screen': ejs.render(getView('chat_screen')),
        'debug_screen': ejs.render(getView('debug_screen'))
    });

});

// Static files
app.use(express.static('public'));

var userList = {};

// Io connection listener
io.on('connection', function (socket) {

    // Whether socket is verified or not
    var verified = false;

    // socket's username !== false if verified
    var username = false;

    // Ip address
    var ip = socket.handshake.address;

    // Socketid shortcut
    var socketid = socket.id;

    // Send server's public key to client
    socket.emit('public_key', RSAPublicKey);

    // Send verify request to user (Show login form)
    socket.emit('request verify');

    // disconnected user
    socket.on('disconnect', function () {
        removeUser(username);
    });

    // incoming message request
    socket.on('message', function (messageData) {

        var messageCallback = {'success': false, "message": ""};
        if (verified) {

            var cypher = messageData.cypher;
            var target = messageData.target;

            if (userList[target]) {
                var targetData = userList[target];

                if (cypher.length > 0 && cypher.length < 5000) {

                    console.log('');
                    console.log('Message from ' + username);

                    messageCallback.success = true;
                    messageCallback.message = 'Message was sent';

                    // add username so client knows which public key to use for decryption
                    io.sockets.connected[targetData.socketId].emit('message', {
                        'cypher': cypher,
                        'from': username
                    });
                }
            } else {
                messageCallback.message = "User not found"
            }

            socket.emit('message_callback', messageCallback);
        }
    });
    
    // client wants to create a new aes key with another client
    socket.on('request_aes', function (request) {

        var messageCallback = {'success': false, "message": ""};

        if (userList[request.target]) {
            var targetData = userList[request.target];

            io.sockets.connected[targetData.socketId].emit('aesKeyRequest', {
                'target': request.target,
                'from': request.from
            });

        } else {
            messageCallback.message = "User not found.";
            socket.emit('aesKeyResponse', messageCallback);
        }
    });

    // client wants to create a new aes key with another client
    socket.on('response_aes_request', function (response) {

        if (userList[response.target]) {
            var targetData = userList[response.target];

            io.sockets.connected[targetData.socketId].emit('aesKeyResponse', {
                'target': response.target,
                'from': response.from,
                'success': true,
                'cypher': response.cypher
            });

        } else {
            socket.emit('aesKeyResponse', {'success': false, "message": "User was not found."});
        }
    });

    // send back salt
    socket.on('request_salt', function (username) {

        var salt = false;

        // select salt for this user
        mysqlConnection.query('SELECT * FROM `users` WHERE LOWER(username) = LOWER(?)', [username], function (err, result, fields) {
            if (err || result.length !== 1) {
                // TODO if no user is found salt varies each time so if salt !== salt in > 2 attempts than user doesn't exist
                salt = randomToken();
            } else {
                salt = result[0].salt;
            }
            socket.emit('login_salt_callback', salt);
        });

    });

    // incoming message request
    socket.on('public_key', function (inputKeys) {
        if (verified) {
            setUserKeys(username, inputKeys);
        }
    });

    // TODO track failed attempts and other login essentials
    // Receive a hash password and re-hash it to verify with the server
    socket.on('login_attempt', function (usernameInput, password_cipher) {

        var callbackResult = {'success': false, 'message': "Invalid login attempt", "username": false};

        if (!verified) {

            console.log('');
            console.log('Login attempt');

            if (password_cipher) {
                var password_hash = rsaDecrypt(password_cipher);
            }

            // // bcrypt hashing exmple, use it to create new users for now
            // bcrypt.genSalt(11, function (err, salt) {
            //     bcrypt.hash(password_hash, salt, function (err, hash) {
            //         console.log('');
            //         console.log(password_hash);
            //         console.log('');
            //         console.log(hash);
            //         console.log('');
            //     });
            // });

            mysqlConnection.query('SELECT * FROM `users` WHERE LOWER(username) = LOWER(?)', [usernameInput], function (err, result, fields) {
                if (err) {
                    callbackResult.message = "Something went wrong";
                    socket.emit('login_attempt_callback', callbackResult);
                    throw err;
                }

                console.log(usernameInput);

                // Only want 1 user/result
                if (result.length === 1) {
                    // hash from the database
                    var db_hash = result[0].hash;

                    // compare password hash with db_hash
                    bcrypt.compare(password_hash, db_hash, function (err, res) {
                        if (!err && res) {

                            callbackResult.success = true;
                            callbackResult.message = 'Succesfully logged in';
                            callbackResult.username = result[0].username;
                            verified = true;

                            // Add user to userlist
                            addUser(result[0].username, socketid, ip);
                            username = result[0].username;

                        } else {
                            console.log('Invalid');
                            callbackResult.message = "Invalid login attempt";
                        }
                        socket.emit('login_attempt_callback', callbackResult);

                        if (err) {
                            console.log(err);
                        }
                    });

                } else {
                    callbackResult.message = "Invalid login attempt";
                    console.log('Return result', callbackResult);
                    socket.emit('login_attempt_callback', callbackResult);
                }
            });
        } else {
            callbackResult.message = "You're already logged in";
            callbackResult.success = true;
            socket.emit('login_attempt_callback', callbackResult);
        }
    });

});

// Set username public key
// param2: key as plain text
function setUserKeys(username, keys) {
    var tempKey = new NodeRSA(keys.publicKey, 'public');
    var tempKeySign = new NodeRSA(keys.publicKeySign, 'public');

    if (tempKey.isPublic() && tempKeySign.isPublic()) {
        userList[username]['public_key'] = tempKey.exportKey('public');
        userList[username]['public_key_sign'] = tempKeySign.exportKey('public');
    }
}

// Add user to userlist
function addUser(userName, socketId, ip) {
    userList[userName] = {'username': userName, 'public_key': false, 'socketId': socketId, 'ip': ip};
}

// Remove user from userlist
function removeUser(userName) {
    delete userList[userName];
}

// Get view contents
function getView(name) {
    return fs.readFileSync(__dirname + '/views/' + name + '.ejs', 'utf8');
}

// ================================================================================
// ============================== Cypto functions =================================
// ================================================================================

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

// Extra timer
setInterval(function () {
    // console.log('');
    // console.log(userList);
}, 5000);


// Server custom heartbeat
setInterval(function () {
    var tempArray = {};

    // Selective data sending
    for (var key in userList) {
        tempArray[key] = {};
        tempArray[key]['username'] = userList[key]['username'];
        tempArray[key]['public_key'] = userList[key]['public_key'];
        tempArray[key]['public_key_sign'] = userList[key]['public_key_sign'];
    }

    io.emit('server_info', {'user_list': tempArray});
}, 1000);