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

// File store for express sessions
// var FileStore = require('session-file-store')(session);

// socket.io listens on port:
var port = 8000;

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
app.set('trust proxy', 1)

// Session settings
// var sessionSettings = {
//     store: new FileStore({}),
//     secret: 'y2ndtyr4378q9mf09egmhq9s4gfs0q9g4fyhy091pf,hq90m4fq87ngf47z4nfg',
//     resave: true,
//     cookie: {
//         maxAge: (1000 * 60 * 60)
//     },
//     saveUninitialized: true
// };

// Make express use sessions
// var sessionMiddleware = session(sessionSettings);

// app.use(sessionMiddleware);

// home path
app.get('/', function (req, res, next) {

    // var data = req.session.data;
    // var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    //
    // if (!data) {
    //     // Default session values
    //     data = {
    //         'verified': false,
    //         'ipChanged': false,
    //         'ip': ip
    //     };
    // } else {
    //     // Check if ip changed
    //     if (data.ip !== ip) {
    //         data.ipChanged = true;
    //     }
    //     // update ip
    //     data.ip = ip;
    // }
    //
    // // Store in session
    // req.session.data = data;
    // req.session.save(function (err) {
    //     // console.log('');
    //     // console.log('Express');
    //     // console.log(req.session);
    // });

    res.render('index', {
        'login_screen': ejs.render(getView('login_screen')),
        'chat_screen': ejs.render(getView('chat_screen'))
    });

});

// Static files
app.use(express.static('public'));

// Use express' sessions
// io.use(function (socket, next) {
//     sessionMiddleware(socket.request, socket.request.res, next);
// });

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

    socket.emit('public_key', RSAPublicKey);

    // // Session failure, exit server
    // if (typeof socket.request.session === "undefined") {
    //     console.log('Failed to load session data in sockets');
    //     process.exit();
    // }
    //
    // var sessionData = socket.request.session.data;
    //
    // // Check if not-verified or ip has changed
    // if (sessionData.verified === false || sessionData.ipChanged) {
    //     sessionData = {
    //         'verified': false,
    //         'ipChanged': false,
    //         'ip': ip
    //     };
    // }

    // TODO check if user is already verified
    // Send verify request to user (Show login form)
    socket.emit('request verify');

    socket.on('message', function (message) {

        var messageCallback = {'success': false, "message": "", "username": username};

        if (verified) {
            if (message.length > 0 && message.length < 255) {
                console.log('');
                console.log('Message: ' + message);
                if (verified) {
                    messageCallback.success = true;
                    messageCallback.message = message;
                    socket.emit('message', messageCallback);
                }
            }
        }

        socket.emit('message_callback', messageCallback);
    });

    // TODO session track failed attempts
    // Receive a hash password and re-hash it to verify with the server
    socket.on('login_attempt', function (usernameInput, password_cipher) {

        var callbackResult = {'success': false, 'message': "Invalid login attempt", "username": false};

        if (!verified) {

            console.log('');
            console.log('Login attempt');

            if (password_cipher) {
                var password_hash = rsaDecrypt(password_cipher);
            }

            mysqlConnection.query('SELECT * FROM `users` WHERE LOWER(username) = LOWER(?)', [usernameInput], function (err, result, fields) {
                if (err) {
                    callbackResult.message = "Something went wrong";
                    socket.emit('login_attempt_callback', callbackResult);
                    throw err;
                }

                // Only want 1 user/result
                if (result.length === 1) {
                    // hash from the database
                    var db_hash = result[0].hash;

                    // compare password ahsh with db_hash
                    bcrypt.compare(password_hash, db_hash, function (err, res) {
                        if (res) {
                            console.log('Valid login');
                            callbackResult.success = true;
                            callbackResult.message = 'Succesfully logged in';
                            callbackResult.username = result[0].username;
                            verified = true;

                            // Add user to userlist
                            addUser(result[0].username);
                            username = result[0].username;

                        } else {
                            console.log('Invalid');
                            callbackResult.message = "Invalid login attempt2";
                        }
                        socket.emit('login_attempt_callback', callbackResult);

                        if (err) {
                            console.log(err);
                        }
                    });

                } else {
                    callbackResult.message = "Invalid login attempt1";
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

// Server custom heartbeat
setInterval(function () {
    io.emit('server_info', {'user_list': userList});
}, 1000);

// Add user to userlist
function addUser(userName) {
    userList[userName] = userName;
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

