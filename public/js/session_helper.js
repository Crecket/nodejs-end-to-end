function ConnectionHelper(socket, CryptoHelper) {

    var verified = false;

    // Crypto stuffs
    var privateKey = false;
    var publicKey = false;

    // Attempt to verify username with server
    this.loginAttempt = function (username, password) {

        // Hash password before submitting
        var passwordHash = CryptoHelper.hash(password);

        // Send attempt to server
        socket.emit('login_attempt', username, passwordHash);

    }

}