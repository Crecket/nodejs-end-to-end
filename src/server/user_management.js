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
                Db.all('SELECT * FROM users', (data, err) => {
                    // set to the users
                    userManagement.users.userList = data && !err ? data : [];
                })
            },
            // store the user list into the config
            saveUsers: () => {
                var stringified = JSON.stringify(userManagement.users.userList);
                fs.writeFile('./src/server/data/users.json', stringified, (err) => {
                    if (err) {
                        console.log('Server failed to save the user list to the config file.');
                        console.log(err.message);
                        return;
                    }
                });
            },
            // add a new user to the config files
            newUser: (username, password, callback) => {
                console.log(userManagement.users);
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
                                // store in the userlist array
                                // userManagement.users.userList[username.toLowerCase()] = {
                                //     username: username,
                                //     password: hash,
                                //     salt: clientSalt
                                // };
                                //
                                // // store the new list in json
                                // userManagement.users.saveUsers();

                                Db.run('INSERT IGNORE INTO users (username, password, salt) VALUES(?,?,?)',
                                    [username, hash, clientSalt],
                                    (result, err) => {
                                        callback(result && !err);
                                    })
                            }
                        });
                    });
                }
            },
            // delete a user
            removeUser: (username) => {
                delete userManagement.users.userList[tempUsername];
                userManagement.users.saveUsers();
            },
            // create test accounts
            createTestAccounts: (amount) => {
                if (!amount) {
                    amount = 100;
                }
                for (var i = 0; i < amount; i++) {
                    userManagement.users.newUser('test' + i, '');
                }
            }
        }
    };

    return userManagement;
};