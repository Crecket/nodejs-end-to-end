function ConnectionHelper(socket, CryptoHelper) {
    var fn = this;

    // current username
    var username = false;
    // boolean wheter this client is verified or not
    var verified = false;

    // ===========================================

    // Full key set, used for decryption/encryption
    var keySet = false;
    // This client's private key, only used for exporting
    var privateKey = false;
    // This client's public key, only used for exporting
    var publicKey = false;

    // ===========================================

    // Full key set, used for signing/verification
    var keySetSign = false;
    // This client's private key, only used for exporting Sign key
    var privateKeySign = false;
    // This client's public key, only used for exporting Sign key
    var publicKeySign = false;

    // ===========================================

    // NodeJS public key
    var serverPublicKey = false;

    // List off all user's and their rsa public keys
    var userList = {};
    // stored aes keys for different users
    var storedKeys = {};

    // username of current target for chat messages
    var targetName = false;
    // Public key of current target for chat messages
    var targetKey = false;

    // list with files that are being transfered
    var fileTransfers = {};

    // shitty fix to store passwords while waiting for the salt
    var tempPassword = "",
        tempUsername = "";

    // Attempt to verify username with server
    this.loginAttempt = function (username, password) {
        // Temporarily store password in var
        tempPassword = password;
        tempUsername = username;

        // Send attempt to server
        socket.emit('request_salt', username);
    };

    // Salt Callback for login attempt
    this.loginSaltCallback = function (salt) {

        // Hash password before submitting
        var passwordHash = CryptoHelper.hash(tempPassword, salt);

        // Encrypt with server's public key
        var passwordCipher = CryptoHelper.rsaEncryptPem(serverPublicKey, passwordHash);

        // Send attempt to server
        socket.emit('login_attempt', tempUsername, passwordCipher);

        // unset temp values
        tempPassword = "";
        tempUsername = "";
    };

    // call back from login attempt
    this.loginAttemptCallback = function (res) {
        if (res.success !== false) {
            verified = true;
            username = res.username;
            this.updateKey();
        }
    };


    // Decrypt a cypher by using the created aes key
    this.receiveMessage = function (receivedData, callback) {
        info('Received message');
        debug(receivedData);

        var message = false;
        if (storedKeys[receivedData.from]) {
            // Decrypt with the sender's aes key
            message = CryptoHelper.aesDecrypt(receivedData.cypher, storedKeys[receivedData.from]['key'], receivedData.iv);
        }

        callback(message);
    };

    // Send a message if user is verified
    this.sendMessage = function (message) {
        if (this.isVerified() && this.hasTarget()) {

            // random iv for every encryption
            var iv = CryptoHelper.newAesIv();

            // Encryp with a stored aes key
            var messageCypher = CryptoHelper.aesEncrypt(message, targetKey, iv);

            // send the cypher and iv to target
            var messageData = {
                'cypher': messageCypher,
                'iv': iv,
                'target': targetName,
                'from': username
            };
            socket.emit('message', messageData);
            info('Sending message to ' + targetName);
            debug(message, messageData);
            return true;
        }
        return false;
    };


    // if user is verified, send the server the current key
    this.updateKey = function () {
        if (verified) {
            debug('Sending public key to server');
            socket.emit('public_key', {'publicKey': publicKey, 'publicKeySign': publicKeySign});
        }
    };

    // Update the user list and check if current target is still available
    this.updateUserList = function (newUserList) {
        userList = newUserList;
        // check if target still exists
        if (!userList[targetName]) {
            targetKey = false;
            delete storedKeys[targetName];
            targetName = false;
            return false;
        }
        return true;
    };

    // set the server's public key
    this.setServerPublicKey = function (key) {
        serverPublicKey = key;
    };


    // request a new aes key from a target
    this.requestAesKey = function (target) {
        debug('Aes key request for ' + target);

        // for verification
        var signature = CryptoHelper.rsaSign(keySetSign, 'Aes request from: ' + username);

        socket.emit('request_aes', {'target': target, 'from': username, 'signature': signature});
    };

    // store a aes key and iv after other client sends it
    this.setAesKey = function (response) {
        if (response.success) {

            // get the sender's data
            if (userList[response.from] && userList[response.from]['public_key_sign']) {

                // get the sender's public key from the stored user list
                var senderPublicKey = userList[response.from]['public_key_sign'];

                // Next decrypt with our own private key
                var serializedData = CryptoHelper.rsaDecrypt(keySet, response.cypher);

                // verify rsa signed signature
                if (CryptoHelper.rsaVerify(senderPublicKey, serializedData, response.signature)) {

                    // parse data
                    var normalData = parseArray(serializedData);

                    // verify iv and key
                    if (normalData.key.length === 64) {

                        // store the key
                        storedKeys[response.from] = {'key': normalData.key, 'rsa_keys': userList[response.from]};
                        targetName = response.from;
                    }
                }
            }
        }
    };

    // create a new aes key and iv to use after other client requests it
    this.createNewAes = function (request) {

        // get the sender's public key from the stored user list
        var senderPublickey = userList[request.from]['public_key'];
        var senderPublickeySign = userList[request.from]['public_key_sign'];

        var payLoad = "Aes request from: " + request.from;

        // first verify that the request was actually sent by the 'from' user
        if (CryptoHelper.rsaVerify(senderPublickeySign, payLoad, request.signature)) {

            // generate new random iv and key
            var key = CryptoHelper.newAesKey();

            // store the key and iv
            storedKeys[request.from] = {'key': key, 'rsa_keys': userList[request.from]};

            // serialize the data we want to send
            var responseSerialized = serializeArray({'key': key});

            // create a signature for our payload
            var signature = CryptoHelper.rsaSign(keySetSign, responseSerialized);

            // encryp with sender's public key
            var cypherResult = CryptoHelper.rsaEncryptPem(senderPublickey, responseSerialized);

            // send to the server
            var payload = {
                'cypher': cypherResult,
                'signature': signature,
                'success': true,
                'from': username,
                'target': request.from
            };
            socket.emit('response_aes_request', payload);
            info('AES request is valid');
            debug("Request", request);
            debug("Response", payload);
        } else {
            warn(request.from + "'s aes request contained a invalid signature");
            var payload = {
                'success': false,
                'message': "The signature does not seem to be from the right person",
                'from': username,
                'target': request.from
            };
            socket.emit('response_aes_request', payload);
            debug("Request", request);
            debug("Response", payload);
        }
    };

    // TODO verification that both users have same key
    // check if key and iv are setup propperly after setting them up
    this.aesConfirmationCheck = function (cypher, from) {

    }


    // create a new key set for this client
    this.newKeySet = function (callback) {
        info('Creating new rsa key set for encryption');
        var newKeyData = CryptoHelper.createKeySet(1024);
        keySet = newKeyData.rsaObj;
        privateKey = newKeyData.privateKey;
        publicKey = newKeyData.publicKey;

        if (callback) {
            callback({'privateKey': privateKey, 'publicKey': publicKey});
        }
        this.updateKey();
    };

    // create a new key set for this client
    this.newKeySetSign = function (callback) {
        info('Creating new rsa key set for signing');
        var newKeyData = CryptoHelper.createKeySet(1024);
        keySetSign = newKeyData.rsaObj;
        privateKeySign = newKeyData.privateKey;
        publicKeySign = newKeyData.publicKey;

        if (callback) {
            callback({'privateKeySign': privateKeySign, 'publicKeySign': publicKeySign});
        }
        this.updateKey();
    };

    // send a file in chunks to a target
    this.sendFile = function (data_package, callback) {
        var index = 0;
        var maxIndex = data_package.length;
        var package = {'target': targetName, 'data': '', 'index': 0, 'maxIndex': maxIndex};

        // use a delayed timer instead of for loop to throttle data
        var timer = setInterval(function () {

            if (!fn.hasAesKey() || !fn.hasTarget()) {
                warn('We no longer have a target/aes key to send the file securely.');
                clearInterval(timer);
                callback(false);
            } else if (index <= maxIndex) {
                // not the last package, update package and key
                package.data = data_package.index;
                package.key = index;

                // random iv for this package
                var iv = CryptoHelper.newAesIv();

                // Encryp with a stored aes key
                var messageCypher = CryptoHelper.aesEncrypt(serializeArray(package), targetKey, iv);

                if (messageCypher !== false) {
                    // send the cypher and iv to target
                    var transferPackage = {
                        'cypher': messageCypher,
                        'iv': iv,
                        'target': targetName,
                        'from': username
                    };
                    socket.emit('file_package_transfer', transferPackage);
                    debug('Sending package to ' + targetName, transferPackage);

                    // Callback the current transfer percentage
                    callback(100 / maxIndex * index);
                } else {
                    warn('Package ' + index + ' could not be encrypted securely');
                    clearInterval(timer);
                    callback(false);
                }
            } else {
                info('Sent all packages to ' + targetName);
                clearInterval(timer);
                callback(true);
            }
            index++;
        }, 10);
    };

    this.receiveFile = function () {

    };

    // return if this private verified variable is true/false
    this.isVerified = function () {
        return verified !== false;
    };

    // check if target is set
    this.hasTarget = function () {
        return targetName !== false;
    };

    // check if we have a stored aes key for a given username
    this.hasAesKey = function (target) {
        if (storedKeys[target]) {
            return true;
        }
        return false;
    }

    // set the new target name and public key
    this.setTarget = function (newTarget) {
        // check if user is verified, exists and target is not self
        if (this.isVerified() && typeof userList[newTarget] !== "undefined" && newTarget !== username) {
            // check if we already have a aes key
            if (storedKeys[newTarget]) {
                // we have a stored key, set the iv/key
                targetKey = storedKeys[newTarget]['key'];
                targetName = newTarget;
                debug('Setting target to: ' + newTarget);
                return true;
            } else {
                // we dont have a stored key, request a new one from target
                fn.requestAesKey(newTarget);
            }
        }
        return false;
    };

    // return current username
    this.getUsername = function () {
        return username;
    };

    // return the key list
    this.getKeyList = function () {
        return storedKeys;
    }

    // remove all aes keys
    this.resetUserList = function () {
        storedKeys = {};
    };
}