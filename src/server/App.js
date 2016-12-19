"use strict";
var fs = require('fs');
var NodeRSA = require('node-rsa');
var Config = require(__dirname + '/Config.js');

module.exports = class Server {
    constructor() {
        // load the config
        this.config = new Config(require(__dirname + '/configs/config.js'));

        // Load our rsa keys
        this.loadRSA();

        // load the database
        this.db = require(__dirname + '/Db.js')(this.config);

        // load the usermanagement moduel
        this.userManagement = require(__dirname + '/UserManagement.js')(this.db);

        // Current time
        this.serverTime = Math.floor(Date.now() / 1000);

        // Create the express webclient
        this.server = require(__dirname + '/Server.js')(this)

    }

    loadRSA() {
        // Retrieve the server's rsa keys
        this.RSAPrivateKey = fs.readFileSync(__dirname + '/certs/rsa.key') + '';
        this.RSAPrivateKeyBits = new NodeRSA(this.RSAPrivateKey, 'private');
        this.RSAPublicKey = fs.readFileSync(__dirname + '/certs/rsa.crt') + '';
        this.RSAPublicKeyBits = new NodeRSA(this.RSAPublicKey, 'public');
    }
}
