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

// Mysql library
var mysql = require('mysql');

// Express sessions
var session = require('express-session')

// File store for express sessions
var FileStore = require('session-file-store')(session);

// socket.io listens on port:
var port = 8000;

// boolean whether we should use ssl
var useSSL = true;

if (useSSL) {

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

} else {

    var http = require('http');
    var server = http.createServer(app);
    console.log('Server started over http');

}

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

// Start listening on port
server.listen(port);

// Express server static files for public folder
console.log('Express started at port: ' + port);

/* ================================================== */
/* ================== SETTINGS ======================= */
/* ================================================== */

// Make express use ejs for rendering views
app.set('view engine', 'ejs');
// trust first proxy
app.set('trust proxy', 1)

// Session settings
var sessionSettings = {
    store: new FileStore({}),
    secret: 'y2ndtyr4378q9mf09egmhq9s4gfs0q9g4fyhy091pf,hq90m4fq87ngf47z4nfg',
    resave: true,
    cookie: {
        maxAge: (1000 * 60 * 60)
    },
    saveUninitialized: true
};


// Make express use sessions
var sessionMiddleware = session(sessionSettings);

app.use(sessionMiddleware);

// home path
app.get('/', function (req, res, next) {
    var data = req.session.data;
    var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

    if (!data) {
        // Default session values
        data = {
            'verified': false,
            'ipChanged': false,
            'ip': ip
        };
    } else {
        // Check if ip changed
        if (data.ip !== ip) {
            data.ipChanged = true;
        }
        // update ip
        data.ip = ip;
    }

    // Store in session
    req.session.data = data;
    req.session.save(function (err) {
        // console.log('');
        // console.log('Express');
        // console.log(req.session);
    });

    var salt = generateSalt();

    res.render('index', {
        'login_screen': ejs.render(getView('login_screen'))
    });

});

// Static files
app.use(express.static('public'));

// Use express' sessions
io.use(function (socket, next) {
    sessionMiddleware(socket.request, socket.request.res, next);
});

// Io connection listener
io.on('connection', function (socket) {
    // Ip address
    var ip = socket.handshake.address;
    // Socketid shortcut
    var socketid = socket.id;

    // Session failure, exit server
    if (typeof socket.request.session === "undefined") {
        console.log('Failed to load session data in sockets');
        process.exit();
    }

    var sessionData = socket.request.session.data;

    // Check if not-verified or ip has changed
    if (sessionData.verified === false || sessionData.ipChanged) {
        sessionData = {
            'verified': false,
            'ipChanged': false,
            'ip': ip
        };
    }

    // TODO check if user is already verified
    // Send verify request to user (Show login form)
    socket.emit('request verify');

    // TODO session track failed attempts
    // Receive a hash password and re-hash it to verify with the server
    socket.on('login_attempt', function (username, password_hash) {

        var success = false;

        mysqlConnection.query('SELECT * FROM `users` WHERE LOWER(username) = ?', [username], function (err, result, fields) {
            if (err) {
                socket.emit('login_attempt_callback', success);
                throw err;
            }

            // Only want 1 user/result
            if (result.length === 1) {

                // hash and salt from the database
                var db_salt = result[0].salt;
                var db_hash = result[0].hash;

                if (checkPkbdf2(password_hash, db_salt, db_hash)) {
                    // valid
                    success = true;
                    return;
                }
            }
        });

        socket.emit('login_attempt_callback', success);
    });

})
;


// Get view contents
function getView(name) {
    return fs.readFileSync(__dirname + '/views/' + name + '.ejs', 'utf8');
}

// Random 128 byte token
function randomToken() {
    return crypto.randomBytes(128).toString('hex');
}

// Checks session data if user is verified
function isVerified(data) {
    if (data.data !== undefined && data.data.verified !== false) {
        return data.data.verified;
    }
    return false;
}


// Pbkdf2 settings
var DEFAULT_HASH_ITERATIONS = 500;
var SALT_SIZE = 192 / 8;
var KEY_SIZE = 768 / 32;

function generateSalt(explicitIterations) {
    var defaultHashIterations = DEFAULT_HASH_ITERATIONS;

    if (explicitIterations !== null && explicitIterations !== undefined) {
        // make sure explicitIterations is an integer
        if (parseInt(explicitIterations, 10) === explicitIterations) {
            throw new Error("explicitIterations must be an integer");
        }
        // and that it is smaller than our default hash iterations
        if (explicitIterations < DEFAULT_HASH_ITERATIONS) {
            throw new Error("explicitIterations cannot be less than " + DEFAULT_HASH_ITERATIONS);
        }
    }

    // get some random bytes
    var bytes = CryptoJS.lib.WordArray.random(SALT_SIZE);

    // convert iterations to Hexadecimal
    var iterations = (explicitIterations || defaultHashIterations).toString(16);

    // concat the iterations and random bytes together.
    return iterations + "." + bytes.toString(CryptoJS.enc.Base64);
}

function hashPkbdf2(value, salt) {
    var i = salt.indexOf(".");
    var iters = parseInt(salt.substring(0, i), 16);
    var key = CryptoJS.PBKDF2(value, salt, {"keySize": KEY_SIZE, "iterations": iters});

    return key.toString(CryptoJS.enc.Base64);
}

function checkPkbdf2(candidate, salt, hashed) {
    return hashPkbdf2(candidate, salt) === hashed;
}
