function CryptoHelper() {

    var encryptionSettings = {
        adata: "",
        iter: 25000,
        mode: "ccm",
        ts: 128,
        ks: 256
    };

    // Encrypt with basic settings
    this.encrypt = function (password, data) {
        return sjcl.encrypt(password, data, encryptionSettings);
    };

    // HMAC sha256 create
    this.hash = function (text) {
        // Not very secure, but sufficient to send to the server for testing
        // TODO stronger algorithm
        var hmac = CryptoJS.HmacSHA256(
            text,
            CryptoJS.SHA1(text)
        );

        return CryptoJS.enc.Hex.stringify(hmac);

        // var sha1 = CryptoJS.SHA1(text, "key");

        // var passwordSalt = CryptoJS.lib.WordArray.random(128 / 8);
        // var derivedKey = CryptoJS.PBKDF2(text, passwordSalt, {iterations: 1000, keySize: 256 / 32});
        // return {'cipher': CryptoJS.enc.Hex.stringify(derivedKey), 'salt': passwordSalt};
    };

    // Verify password length/type etz
    this.validPasswordType = function (password) {
        if (password.length < 1 || password.length > 512) {
            return false;
        }
        return true;
    };

    // Create new RSA keyset, default keysize is 1024
    this.createKeySet = function (keySize) {

        if (!keySize) {
            keySize = 1024;
        }

        var crypt = new JSEncrypt({default_key_size: keySize});
        crypt.getKey();

        return {
            'keySize': keySize,
            'privateKey': crypt.getPrivateKey(),
            'publicKey': crypt.getPublicKey()
        };
    };

}