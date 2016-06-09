// RSA encryption
var NodeRSA = require('node-rsa');
// Bcrypt support
var bcrypt = require('bcrypt');
// CryptoJS library
var CryptoJS = require("crypto-js");
// file management
var fs = require('fs');
// Generic crypto
var crypto = require('crypto');
// Random 128 byte token
function randomToken() {
    return crypto.randomBytes(128).toString('hex');
}

var userManagement = {
    session: {
        // stored users in this session
        userList: {},
        // return the user list
        getUserList: function () {
            return this.userList;
        },
        // update timestamp for this user
        updateTime: function (userName) {
            if (this.userList[userName]) {
                this.userList[userName]['last_activity'] = new Date();
                return true;
            }
            return false;
        },
        // add a new user to the session
        addUser: function (userName, socketId, ip) {
            this.userList[userName] = {
                'username': userName,
                'public_key': false,
                'socketId': socketId,
                'allow_files': false,
                'ip': ip,
                'last_activity': new Date()
            };
        },
        // remove user from the list
        removeUser: function (userName) {
            delete this.userList[userName];
        },
        // set the public keys for a user
        setUserKeys: function (username, keys) {
            if (keys) {
                // create NodeRSA object so we can check the properties
                var tempKey = new NodeRSA(keys.publicKey, 'public');
                var tempKeySign = new NodeRSA(keys.publicKeySign, 'public');

                // check if both keys have public propperties and check if user exists
                if (tempKey.isPublic() && tempKeySign.isPublic() && this.userList[username]) {
                    // export as pem
                    this.userList[username]['public_key'] = tempKey.exportKey('public');
                    // export as pem
                    this.userList[username]['public_key_sign'] = tempKeySign.exportKey('public');
                    return true;
                }
            }
            return false;
        }
    },
    users: {
        userList: {},
        //get userlist
        getUserList: function () {
            return this.userList;
        },
        // load the userlist from the config
        loadUsers: function () {
            try {
                var data = fs.readFileSync('./src/server/configs/users.json');
                var TempList = JSON.parse(data);
            } catch (err) {
                console.log('Server failed to load and parse the user list from the config.')
                console.log(err);
            }
            // set to the variable
            this.userList = TempList;
        },
        // store the user list into the config
        saveUsers: function () {
            var stringified = JSON.stringify(this.userList);
            fs.writeFile('./src/server/configs/users.json', stringified, function (err) {
                if (err) {
                    console.log('Server failed to save the user list to the config file.');
                    console.log(err.message);
                    return;
                }
            });
        },
        // add a new user to the config files
        newUser: function (username, password, callback) {
            var fn = this;
            // check if user already exists
            if (!this.userList[username.toLowerCase()]) {

                // salt to use in the client
                var clientSalt = randomToken();

                // hash that the client would generate
                var clientHash = CryptoJS.enc.Hex.stringify(CryptoJS.SHA512(password + clientSalt));

                // hash the password with bcrypt
                bcrypt.genSalt(11, function (err, salt) {
                    bcrypt.hash(clientHash, salt, function (err, hash) {
                        if (!err && hash) {
                            // store in the userlist array
                            fn.userList[username.toLowerCase()] = {
                                username: username,
                                password: hash,
                                salt: clientSalt
                            };

                            // store the new list in json
                            fn.saveUsers();

                            // callback
                            if (callback) {
                                callback(true);
                            }
                        }
                    });
                });
            }
        }
    }
};

module.exports = userManagement;