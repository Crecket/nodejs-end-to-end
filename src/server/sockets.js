//  https://github.com/auth0/socketio-jwt#example-usage

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
        // get the stored users
        userManagement.session.removeUser(username);
        // send to all clients
        socket.broadcast.emit('user_disconnect', username, userManagement.session.getUserList());
    });

    // incoming message request
    socket.on('message', function (messageData) {

        var messageCallback = {'success': false, "message": ""};
        if (verified) {

            var cypher = messageData.cypher;
            var target = messageData.target;

            // get the stored users
            var sessionUsers = userManagement.session.getUserList();

            if (sessionUsers[target]) {
                var targetData = sessionUsers[target];

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
            // get the stored users
            var sessionUsers = userManagement.session.getUserList();
            if (sessionUsers[request.target]) {
                var targetData = sessionUsers[request.target];
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
            // get the stored users
            var sessionUsers = userManagement.session.getUserList();
            if (sessionUsers[response.target]) {
                var targetData = sessionUsers[response.target];

                io.sockets.connected[targetData.socketId].emit('aesKeyResponse', response);
            }
        }
    });

    // confirm a aes request to ensure both clients know which keys to use
    socket.on('confirm_aes', function (request) {
        if (verified) {
            // get the stored users
            var sessionUsers = userManagement.session.getUserList();

            if (sessionUsers[request.target]) {
                var targetData = sessionUsers[request.target];
                io.sockets.connected[targetData.socketId].emit('confirm_aes', request);
            }
        }
    });

    // confirm a aes request response
    socket.on('confirm_aes_response', function (request) {
        if (verified) {
            var userList = userManagement.session.getUserList();
            if (userList[request.target]) {
                var targetData = userList[request.target];
                io.sockets.connected[targetData.socketId].emit('confirm_aes_response', request);
            }
        }
    });

    // send back salt
    socket.on('request_salt', function (username) {
        var salt = false;

        // get the stored users
        var storedUsers = userManagement.users.getUserList();

        // check if exists
        var lookupuser = storedUsers[username.toLowerCase()];
        if (lookupuser) {
            // get the salt
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
            if (userManagement.session.setUserKeys(username, inputKeys)) {
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
        var userList = userManagement.session.getUserList();
        userList[username]['allow_files'] = bool;
    });

    // TODO track failed attempts and other login essentials
    // Receive a hash password and re-hash it to verify with the server
    socket.on('login_attempt', function (usernameInput, password_cipher) {
        var callbackResult = {'success': false, 'message': "Invalid login attempt", "username": false};

        var storedUsers = userManagement.users.getUserList();

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

            var lookupuser = storedUsers[usernameInput.toLowerCase()];

            // check if defined
            if (lookupuser) {

                // Only want 1 user/result
                if (lookupuser) {
                    // hash from the database
                    var db_hash = lookupuser.password;

                    // compare password hash with db_hash
                    bcrypt.compare(password_hash, db_hash, function (err, res) {
                        if (!err && res) {

                            var storedSessionUsers = userManagement.session.getUserList();

                            // check if the user is already active
                            if(!storedSessionUsers[usernameInput.toLowerCase()]){
                                callbackResult.success = true;
                                callbackResult.message = 'Succesfully logged in';
                                callbackResult.username = lookupuser.username;
                                verified = true;

                                // Add user to userlist
                                userManagement.session.addUser(lookupuser.username, socketid, ip);
                                username = lookupuser.username;
                            }else{
                                // user already has a active session
                                callbackResult.success = false;
                                callbackResult.message = 'This user is already active in a different client.';
                            }

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
            userManagement.session.updateTime(username);
        }
    });
});

// send server info for sockets
function sendServerInfo() {
    var tempArray = {};
    // update server time
    serverTime = Math.floor(Date.now() / 1000);

    var tempUserList = userManagement.session.getUserList();

    // Loop through user list so we can filter what data we send
    for (var key in tempUserList) {
        tempArray[key] = {};
        tempArray[key]['username'] = tempUserList[key]['username'];
        tempArray[key]['public_key'] = tempUserList[key]['public_key'];
        tempArray[key]['public_key_sign'] = tempUserList[key]['public_key_sign'];
    }

    // send to client
    io.emit('server_info', {
        'user_list': tempArray,
        'publicKey': RSAPublicKey,
        'time': serverTime
    });
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

// Server custom heartbeat, send basic information to the client every second
setInterval(sendServerInfo, 1000);