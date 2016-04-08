function ConnectionHelper(socket, CryptoHelper) {

    var username = false;

    var verified = false;

    // NodeJS public key
    this.publicKey = false;

    // Attempt to verify username with server
    this.loginAttempt = function (username, password) {

        // Hash password before submitting
        var passwordHash = CryptoHelper.hash(password);

        // Encrypt with server's public key
        var passwordCipher = CryptoHelper.rsaEncryptPublicKey(this.publicKey, passwordHash);

        // Send attempt to server
        socket.emit('login_attempt', username, passwordCipher);

    }

    // call back from login attempt
    this.loginAttemptCallback = function (res) {
        if (res.success !== false) {
            verified = true;
            username = res.username;
        }
    }

    // Send a message if user is verified
    this.sendMessage = function (message) {
        if (this.isVerified()) {
            socket.emit('message', message);
        } else {
            console.log('not verified');
        }
    }

    this.isVerified = function () {
        return verified !== false;
    }

}