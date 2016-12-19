var helmet = require('helmet');
var express = require('express');
var https = require('https');
var os = require('os');
var SocketIO = require('socket.io')

// Express app
var app = express();

module.exports = function (Server) {

    // start the express server using either the online or offline settings
    var server = https.createServer(Server.config.get('sslOptions'), app);
    // console.log('Server started over https for host: ' + os.hostname().trim());

    // Start the Socket.IO app
    var io = SocketIO.listen(server);

    // Load the sockets
    require(__dirname + '/Sockets.js')(io, Server);

    // Make express use ejs for rendering views
    app.set('view engine', 'ejs');

    // trust first proxy
    app.set('trust proxy', 1);

    // change default views directory
    app.set('views', __dirname + '/views');

    // use helmet to establish hsts
    app.use(helmet.hsts({
        maxAge: 31536000000,
        includeSubdomains: true,
        force: true
    }));

    // home path
    app.get('/', function (req, res, next) {
        res.render('index.ejs');
    });

    // Express server static files for public folder
    app.use(express.static('app'));

    // Start listening on the server
    server.listen(Server.config.get('port'));
    // console.log('Express started at port: ' + Server.config.get('port'));

    return {
        server: server,
        app: app,
        io: io
    };
}

