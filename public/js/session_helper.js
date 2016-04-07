function ConnectionHelper(socket, CryptoHelper) {

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

}