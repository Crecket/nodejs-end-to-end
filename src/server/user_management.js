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
randomToken = () => {
    return crypto.randomBytes(128).toString('hex');
}


module.exports = (Db) => {
    var userManagement;
    userManagement = {
        session: {
            // stored users in this session
            userList: {},
            // return the user list
            getUserList: () => {
                return userManagement.session.userList;
            },
            // update timestamp for this user
            updateTime: (userName) => {
                if (userManagement.session.userList[userName]) {
                    userManagement.session.userList[userName]['last_activity'] = new Date();
                    return true;
                }
                return false;
            },
            // add a new user to the session
            addUser: (userName, socketId, ip) => {
                userManagement.session.userList[userName] = {
                    'username': userName,
                    'public_key': false,
                    'socketId': socketId,
                    'allow_files': false,
                    'ip': ip,
                    'last_activity': new Date()
                };
            },
            // remove user from the list
            removeUser: (userName) => {
                delete userManagement.session.userList[userName];
            },
            // set the public keys for a user
            setUserKeys: (username, keys) => {
                if (keys) {
                    // create NodeRSA object so we can check the properties
                    var tempKey = new NodeRSA(keys.publicKey, 'public');
                    var tempKeySign = new NodeRSA(keys.publicKeySign, 'public');

                    // check if both keys have public propperties and check if user exists
                    if (tempKey.isPublic() && tempKeySign.isPublic() && userManagement.session.userList[username]) {
                        // export as pem
                        userManagement.session.userList[username]['public_key'] = tempKey.exportKey('public');
                        // export as pem
                        userManagement.session.userList[username]['public_key_sign'] = tempKeySign.exportKey('public');
                        return true;
                    }
                }
                return false;
            }
        },
        users: {
            userList: {},
            //get userlist
            getUserList: () => {
                return userManagement.users.userList;
            },
            // load the userlist from the config
            loadUsers: () => {
                // Select all users from the database
                Db.all('SELECT * FROM users', (err, data) => {
                    var tempUserList = !data || err ? {} : data;
                    var newUserList = {};

                    // re-format list
                    Object.keys(tempUserList).map((key)=>{
                        newUserList[tempUserList[key]['username']] = tempUserList[key];
                    })

                    // set to the users
                    userManagement.users.userList = newUserList;
                })
            },

            // add a new user to the config files
            newUser: (username, password, callback) => {
                // check if user already exists
                if (!userManagement.users.userList[username.toLowerCase()]) {

                    // salt to use in the client
                    var clientSalt = randomToken();

                    // hash that the client would generate
                    var clientHash = CryptoJS.enc.Hex.stringify(CryptoJS.SHA512(password + clientSalt));

                    // hash the password with bcrypt
                    bcrypt.genSalt(11, (err, salt) => {
                        bcrypt.hash(clientHash, salt, (err, hash) => {
                            if (!err && hash) {
                                // attempt to insert into the database
                                Db.run('INSERT OR REPLACE INTO users (username, password, salt) VALUES(?,?,?)',
                                    // insert values
                                    [username.toLowerCase(), hash, clientSalt],
                                    // callback
                                    (result, err) => {
                                        // update the value
                                        userManagement.users.userList[username.toLowerCase()] = {
                                            username: username,
                                            password: hash,
                                            salt: clientSalt
                                        };

                                        // console.log("Inserted user " + username);
                                        if (callback) {
                                            callback(!err);
                                        }
                                    }
                                )
                            }
                        });
                    });
                }
            },
            // delete a user
            removeUser: (username, callback) => {
                // attempt to delete user
                Db.run('DELETE FROM users WHERE username = ?', [username], (result, err) => {
                    // console.log("Removed user " + username);

                    // remove user from list
                    delete userManagement.users.userList[username];

                    if (callback) {
                        callback(!err);
                    }
                })
            },
            // create test accounts
            createTestAccounts: (amount) => {
                if (!amount) {
                    amount = 100;
                }
                // create 1 new user with amount
                userManagement.users.newUser('test' + amount, '', (result) => {
                    // rerun function but with 1 less user
                    userManagement.users.createTestAccounts(amount - 1);
                });
            }
        }
    };

    return userManagement;
};