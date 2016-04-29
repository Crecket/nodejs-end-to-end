function ConnectionHelper(socket, CryptoHelper) {

    // current username
    var username = false;
    // boolean wheter this client is verified or not
    var verified = false;
    // Full key set, used for decryption/encryption
    var keySet = false;
    // This client's private key, only used for exporting
    var privateKey = false;
    // This client's public key, only used for exporting
    var publicKey = false;

    // NodeJS public key
    var serverPublicKey = false;

    // List off all user's public key lists and username
    var userList = {};

    // username of current target for chat messages
    var targetName = false;
    // Public key of current target for chat messages
    var targetKey = false;

    var tempPassword = "",
        tempUsername = "";

    // Attempt to verify username with server
    this.loginAttempt = function (username, password) {
        // Temporarily store password in var
        tempPassword = password;
        tempUsername = username;

        // Send attempt to server
        socket.emit('request_salt', username);
    }

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
    }

    // call back from login attempt
    this.loginAttemptCallback = function (res) {
        if (res.success !== false) {
            verified = true;
            username = res.username;

            this.updateKey();
        }
    }

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
    }

    // Send a message if user is verified
    this.sendMessage = function (message) {
        if (this.isVerified() && this.hasTarget()) {

            // First encrypt with our own private key
            var messageCypher1 = CryptoHelper.rsaEncryptPriv(keySet, message);

            // Encrypt with target public key
            var messageCypher2 = CryptoHelper.rsaEncryptPem(targetKey, messageCypher1);

            socket.emit('message', {
                'cypher': messageCypher2,
                'target': targetName
            });

        } else {
            debug('Not verified');
        }
    }

    // return if this private verified variable is true/false
    this.isVerified = function () {
        return verified !== false;
    }

    // if user is verified, send the server the current key
    this.updateKey = function () {
        if (verified) {
            debug('Sending public key to server');
            socket.emit('public_key', publicKey);
        }
    }

    // Update the user list and check if current target is still available
    this.updateUserList = function (newUserList) {
        userList = newUserList;
        if (!userList[targetName]) {
            targetKey = false;
            targetName = false;
        }
    }

    // check if target is set
    this.hasTarget = function () {
        return targetName !== false;
    }

    // set the new target name and public key
    this.setTarget = function (newTarget) {
        if (this.isVerified() && typeof userList[newTarget] !== "undefined" && newTarget !== username) {
            targetName = newTarget;
            targetKey = userList[newTarget]['public_key'];
            return true;
        }
        return false;
    }

    // set the server's public key
    this.setServerPublicKey = function (key) {
        serverPublicKey = key;
    }

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
    }

    // return current username
    this.getUsername = function () {
        return username;
    }

}