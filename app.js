// CryptoJS library
var CryptoJS = require("crypto-js");

// sjcl library
// var sjcl = require("sjcl");

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

// Express app
var app = express();

// RSA encryption
var NodeRSA = require('node-rsa');

// Bcrypt support
var bcrypt = require('bcrypt');

// Load app-vars
var config = require('./src/config');

// will contain all the registered users
var userDatabaseList = {};

if (os.hostname().trim() === "CrecketMe") {

    var options = {
        // key: fs.readFileSync('/home/crecket/crecket.me.key'),
        // cert: fs.readFileSync('/home/crecket/crecket_me.crt'),
        key: fs.readFileSync('/etc/letsencrypt/live/crecket.me/privkey.pem'),
        cert: fs.readFileSync('/etc/letsencrypt/live/crecket.me/cert.pem'),
        ca: [fs.readFileSync('/etc/letsencrypt/live/crecket.me/chain.pem')],
        requestCert: false
    };
    var https = require('https');
    var server = https.createServer(options, app);
    console.log('Online server started over https. ' + os.hostname().trim());

    // Create mysql connection
    var mysqlConnection = mysql.createConnection('mysql://crecket:' + config.MysqlPasswordOnline + '@localhost/nodejs_db?debug=false');
} else {

    var options = {
        key: fs.readFileSync('src/certs/domain.key'),
        cert: fs.readFileSync('src/certs/domain.crt'),
        requestCert: false
    };
    var https = require('https');
    var server = https.createServer(options, app);
    console.log('Offline server started over https. ' + os.hostname().trim());

}

/**
 * A rsa key example is in this repo, make sure to generate your own in production enviroments!
 */
// Load RSA private and public key
var RSAPrivateKey = fs.readFileSync('src/certs/rsa.key') + '';
var RSAPrivateKeyBits = new NodeRSA(RSAPrivateKey, 'private');

var RSAPublicKey = fs.readFileSync('src/certs/rsa.crt') + '';
var RSAPublicKeyBits = new NodeRSA(RSAPublicKey, 'public');


// Socket io app
var io = require('socket.io').listen(server);

var serverTime = Math.floor(Date.now() / 1000)

// Start listening on port
server.listen(config.port);

// Express server static files for public folder
console.log('Express started at port: ' + config.port);

/* ================================================== */
/* ================== SETTINGS ====================== */
/* ================================================== */

// Make express use ejs for rendering views
app.set('view engine', 'ejs');

// trust first proxy
app.set('trust proxy', 1);

// change default views directory
app.set('views', __dirname + '/src/views');

// home path
app.get('/', function (req, res, next) {
    res.render('index');
});

// Static files
app.use(express.static('app'));

var userList = {};

// Io connection listener
io.on('connection', function (socket) {

    // Whether socket is verified or not
    var verified = false;

    // socket's username !== false if verified
    var username = false;

    // ip address
    var ip = socket.handshake.address;

    // Socketid shortcut
    var socketid = socket.id;

    // Send server's public key to client and other basic info
    sendServerInfo();

    // Send verify request to user (Show login form)
    socket.emit('request verify');

    // disconnected user
    socket.on('disconnect', function () {
        removeUser(username);
        // send to all clients
        socket.broadcast.emit('user_disconnect', username, userList);
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
                    console.log('Message from ' + username, messageData);

                    messageCallback.success = true;
                    messageCallback.message = 'Message was sent';

                    // add username so client knows which public key to use for decryption
                    io.sockets.connected[targetData.socketId].emit('message', {
                        'cypher': cypher,
                        'iv': messageData.iv,
                        'target': target,
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
        if (verified) {
            if (userList[request.target]) {
                var targetData = userList[request.target];
                io.sockets.connected[targetData.socketId].emit('aesKeyRequest', request);
            } else {
                messageCallback.message = "User not found.";
                socket.emit('aesKeyResponse', messageCallback);
            }
        }
    });

    // client wants to create a new aes key with another client
    socket.on('response_aes_request', function (response) {
        if (verified) {
            if (userList[response.target]) {
                var targetData = userList[response.target];

                io.sockets.connected[targetData.socketId].emit('aesKeyResponse', response);
            }
        }
    });

    // confirm a aes request to ensure both clients know which keys to use
    socket.on('confirm_aes', function (request) {
        if (verified) {
            if (userList[request.target]) {
                var targetData = userList[request.target];
                io.sockets.connected[targetData.socketId].emit('confirm_aes', request);
            }
        }
    });

    // confirm a aes request response
    socket.on('confirm_aes_response', function (request) {
        if (verified) {
            if (userList[request.target]) {
                var targetData = userList[request.target];
                io.sockets.connected[targetData.socketId].emit('confirm_aes_response', request);
            }
        }
    });

    // send back salt
    socket.on('request_salt', function (username) {
        var salt = false;
        var lookupuser = userDatabaseList[username.toLowerCase()];
        // get the salt
        if (lookupuser) {
            // user exists
            salt = lookupuser.salt;
        } else {
            // TODO if no user is found salt varies each time so if salt !== salt in > 2 attempts than user doesn't exist
            salt = randomToken();
        }
        socket.emit('login_salt_callback', salt);
    });

    // incoming message request
    socket.on('public_key', function (inputKeys) {
        if (verified) {
            if (setUserKeys(username, inputKeys)) {
                if (inputKeys.publicKey && inputKeys.publicKeySign) {
                    // Only log if both are set to avoid double logs on startup
                    console.log(username, 'Updated public keys');
                }
            } else {
                socket.emit('request verify');
            }
        } else {
            socket.emit('request verify');
        }
    });

    // change upload file setting
    socket.on('upload_setting', function (bool) {
        userList[username]['allow_files'] = bool;
    });

    // TODO track failed attempts and other login essentials
    // Receive a hash password and re-hash it to verify with the server
    socket.on('login_attempt', function (usernameInput, password_cipher) {
        var callbackResult = {'success': false, 'message': "Invalid login attempt", "username": false};

        if (!verified) {

            console.log('');
            console.log('Login attempt ' + usernameInput);

            if (password_cipher) {
                var password_hash = rsaDecrypt(password_cipher);
            } else {
                callbackResult.message = "Invalid request";
                callbackResult.success = true;
                socket.emit('login_attempt_callback', callbackResult);
                return;
            }

            var lookupuser = userDatabaseList[usernameInput.toLowerCase()];

            console.log(lookupuser);

            // check if defined
            if (lookupuser) {

                // Only want 1 user/result
                if (lookupuser) {
                    // hash from the database
                    var db_hash = lookupuser.password;

                    // compare password hash with db_hash
                    bcrypt.compare(password_hash, db_hash, function (err, res) {
                        if (!err && res) {

                            callbackResult.success = true;
                            callbackResult.message = 'Succesfully logged in';
                            callbackResult.username = lookupuser.username;
                            verified = true;

                            // Add user to userlist
                            addUser(lookupuser.username, socketid, ip);
                            username = lookupuser.username;
                        } else {
                            callbackResult.message = "Invalid login attempt";
                            console.log('Return result', callbackResult);
                        }

                        socket.emit('login_attempt_callback', callbackResult);
                    });

                } else {
                    callbackResult.message = "Invalid login attempt";
                    console.log('Return result', callbackResult);
                    socket.emit('login_attempt_callback', callbackResult);
                }
            }
        } else {
            callbackResult.message = "";
            callbackResult.success = true;
            socket.emit('login_attempt_callback', callbackResult);
        }
    });

    // refresh user timestamps
    socket.on('heart_beat', function () {
        if (verified) {
            refreshUser(username);
        }
    });
});

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

// Get view contents
function getView(name) {
    return fs.readFileSync(__dirname + '/src/views/' + name + '.ejs', 'utf8');
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
        var data = fs.readFileSync('./src/users.json');
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
    fs.writeFile('./src/users.json', stringified, function (err) {
        if (err) {
            console.log('Server failed to save the user list to the config file.');
            console.log(err.message);
            return;
        }
    });
}

loadDatabaseUsers();

// addDatabaseUser('Crecket', '1234', function (result) {
// });
// addDatabaseUser('Admin', '1234', function (result) {
// });
// addDatabaseUser('test1', '', function (result) {
// });
// addDatabaseUser('test2', '', function (result) {
// });
// addDatabaseUser('test3', '', function (result) {
// });
// addDatabaseUser('test4', '', function (result) {
// });
// addDatabaseUser('test5', '', function (result) {
// });


// Server custom heartbeat
setInterval(sendServerInfo, 1000);