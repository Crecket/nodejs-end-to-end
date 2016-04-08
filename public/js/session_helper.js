function ConnectionHelper(socket, CryptoHelper) {

    var username = false;

    var verified = false;

    // NodeJS public key
    this.serverPublicKey = false;


    // Full key set, used for decryption/encryption
    var keySet = false;

    // This client's private key, only used for exporting
    var privateKey = false;

    // This client's public key, only used for exporting
    var publicKey = false;

    // Attempt to verify username with server
    this.loginAttempt = function (username, password) {

        debug('Login attempt');

        // Hash password before submitting
        var passwordHash = CryptoHelper.hash(password);

        // Encrypt with server's public key
        var passwordCipher = CryptoHelper.rsaEncryptPem(this.serverPublicKey, passwordHash);

        // Send attempt to server
        socket.emit('login_attempt', username, passwordCipher);
    }

    // call back from login attempt
    this.loginAttemptCallback = function (res) {

        debug('Login callback ' + res.success);

        if (res.success !== false) {
            verified = true;
            username = res.username;

            debug('Sending public key to server');
            socket.emit('public_key', publicKey);
        }
    }

    // Decrypt a message using our private key
    this.receiveMessage = function (cypher) {
        var message = CryptoHelper.rsaDecrypt(keySet, cypher);
        return message;
    }

    // Send a message if user is verified
    this.sendMessage = function (message) {
        if (this.isVerified()) {
            var messageCypher = CryptoHelper.rsaEncryptPem(publicKey, message);
            socket.emit('message', messageCypher);
        } else {
            debug('Not verified');
        }
    }

    // return if this private verified variable is true/false
    this.isVerified = function () {
        return verified !== false;
    }

    // create a new key set for this client
    this.newKeySet = function () {
        var newKeyData = CryptoHelper.createKeySet();

        keySet = newKeyData.rsaObj;

        debug('Creating new rsa key set');
        debug(keySet);

        privateKey = newKeyData.privateKey;
        publicKey = newKeyData.publicKey;
    }

    // create initial keyset
    this.newKeySet();
}