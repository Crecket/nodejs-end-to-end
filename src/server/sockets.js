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

// send server info for sockets
function sendServerInfo() {
    var tempArray = {};
    // update server time
    serverTime = Math.floor(Date.now() / 1000);

    // Loop through user list so we can filter what data we send
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