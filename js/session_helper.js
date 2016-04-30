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

    // List off all user's public key lists and username
    var userList = {};

    // stored aes keys for different users
    var storedKeys = {};

    // username of current target for chat messages
    var targetName = false;
    // Public key of current target for chat messages
    var targetKey = false;

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

    // Decrypt a cypher by using our private key
    // Next, decrypt the new cypher with the sender's public key
    this.receiveMessage = function (receivedData, callback) {

        // First decrypt with our own private key
        var cypher2 = CryptoHelper.rsaDecrypt(keySet, receivedData.cypher);

        // get the sender's public key from the stored user list
        var senderPublickey = userList[receivedData.from]['public_key'];

        // Decrypt with the sender's public key
        var message = CryptoHelper.rsaDecryptPemPub(senderPublickey, cypher2);

        callback(message);
    };

    // Send a message if user is verified
    this.sendMessage = function (message) {
        if (this.isVerified() && this.hasTarget()) {

            // Encryp with a stored aes key
            var messageCypher = CryptoHelper.aesEncrypt(message, targetKey.key, targetKey.iv);

            socket.emit('message', {
                'cypher': messageCypher,
                'target': targetName,
                'from': username
            });

        } else {
            debug('Not verified');
        }
    };

    // return if this private verified variable is true/false
    this.isVerified = function () {
        return verified !== false;
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
            targetName = false;
            return false;
        }
        return true;
    };

    // check if target is set
    this.hasTarget = function () {
        return targetName !== false;
    };

    // set the new target name and public key
    this.setTarget = function (newTarget) {
        // check if user is verified, exists and target is not self
        if (this.isVerified() && typeof userList[newTarget] !== "undefined" && newTarget !== username) {

            // check if we already have a aes key
            if (storedKeys[newTarget] && storedKeys[newTarget]['key']) {
                // we have a stored key, set the iv/key
                targetKey = {'key': storedKeys[newTarget]['key'], 'iv': userList[newTarget]['iv']};
                targetName = newTarget;
                debug('Setting target to: ' + newTarget);
                return true;
            } else {
                // we dont have a stored key, request a new one from target
                fn.requestAesKey(newTarget);
                // set to true to avoid double requests
                storedKeys[newTarget] = true;
                debug('Requires new key');
            }
        }
        return false;
    };

    // TODO aes exchange use rsa in the request for verification
    // request a new aes key from a target
    this.requestAesKey = function (target) {
        console.log('Aes request for ' + target);

        // for verification
        var signature = CryptoHelper.rsaSign(keySetSign, 'Aes request from: ' + username);

        socket.emit('request_aes', {'target': target, 'from': username, 'signature': signature});
    };

    // store a aes key and iv after other client sends it
    this.setAesKey = function (response, callback) {

        var resultname = "";
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
                    if (normalData.iv.length === 32 && normalData.key.length === 64) {

                        // store the key and iv
                        storedKeys[response.from] = {'iv': normalData.iv, 'key': normalData.key};
                        targetName = resultname = response.from;

                    }
                }
            }
        }
        // callback
        callback(resultname);
    };

    // create a new aes key and iv to use after other client requests it
    this.createNewAes = function (request) {

        // get the sender's public key from the stored user list
        var senderPublickey = userList[request.from]['public_key_sign'];

        var payLoad = "Aes request from: " + request.from;

        // first verify that the request was actually sent by the 'from' user
        if (CryptoHelper.rsaVerify(senderPublickey, payLoad, request.signature)) {

            // generate new random iv and key
            var iv = CryptoHelper.newAesIv();
            var key = CryptoHelper.newAesKey();

            // store the key and iv
            storedKeys[request.from] = {'iv': iv, 'key': key};

            // serialize the data
            var responseSerialized = serializeArray({'iv': iv, 'key': key, 'comment': 'Iv 16bit, Key 32bit'});

            // create a signature for our payload
            var signature = CryptoHelper.rsaSign(keySetSign, responseSerialized);

            // encryp with sender's public key
            var cypherResult = CryptoHelper.rsaEncryptPem(senderPublickey, responseSerialized);

            // send to the server
            socket.emit('response_aes_request', {
                'cypher': cypherResult,
                'signature': signature,
                'success': true,
                'from': username,
                'target': request.from
            });
        } else {
            socket.emit('response_aes_request', {
                'success': false,
                'message': "The signature does not seem to be from the right person",
                'from': username,
                'target': request.from
            });
        }
    };

    // TODO verification that both users have same key
    // check if key and iv are setup propperly after setting them up
    this.aesConfirmationCheck = function (cypher, from) {

        debug('Setting target to: ' + userName);
    }

    // set the server's public key
    this.setServerPublicKey = function (key) {
        serverPublicKey = key;
    };

    // create a new key set for this client
    this.newKeySet = function (callback) {
        var newKeyData = CryptoHelper.createKeySet(1024);

        keySet = newKeyData.rsaObj;

        debug('Creating new rsa key set');
        debug(keySet);

        privateKey = newKeyData.privateKey;
        publicKey = newKeyData.publicKey;

        if (callback) {
            callback({'privateKey': privateKey, 'publicKey': publicKey});
        }

        this.updateKey();
    };

    // create a new key set for this client
    this.newKeySetSign = function (callback) {
        var newKeyData = CryptoHelper.createKeySet(1024);

        keySetSign = newKeyData.rsaObj;

        debug('Creating new rsa key set signing');
        debug(keySetSign);

        privateKeySign = newKeyData.privateKey;
        publicKeySign = newKeyData.publicKey;

        if (callback) {
            callback({'privateKeySign': privateKeySign, 'publicKeySign': publicKeySign});
        }

        this.updateKey();
    };

    // check if a aes key is stored for given username
    this.hasAes = function (name) {
        return;
    }

    // return current username
    this.getUsername = function () {
        return username;
    };

    this.testSign = function () {
        var text = 'some random text';

        var res = CryptoHelper.rsaSign(keySetSign, text);

        debug(res);

        text = 'some random text';

        var res2 = CryptoHelper.rsaVerify(publicKeySign, text, res);

        debug(res2);
    };
}