function CryptoHelper() {

    var encryptionSettings = {
        adata: "",
        iter: 25000,
        mode: "ccm",
        ts: 128,
        ks: 256
    };

    // Encrypt with password
    this.encryptPassword = function (password, data) {
        return sjcl.encrypt(password, data, encryptionSettings);
    };

    // Encrypt with a public key in pem format
    this.rsaEncryptPem = function (PublicKey, data) {
        var NodeRSAObj = new NodeRSA();
        NodeRSAObj.importKey(PublicKey, 'pkcs8-public');
        return NodeRSAObj.encrypt(data, 'base64');
    };

    // Decrypt a cypher using our private key
    this.rsaDecrypt = function (keySet, cypher) {
        return keySet.decrypt(cypher, 'utf8');
    }

    // Encrypt data using our private key
    this.rsaEncrypt = function (keySet, data) {
        return keySet.encrypt(data, 'base64');
    }

    // HMAC sha256 create
    this.hash = function (text) {
        // Not very secure, but sufficient to send to the server for testing
        // TODO stronger algorithm/salt
        var hmac = CryptoJS.HmacSHA256(
            text,
            CryptoJS.SHA1(text)
        );

        return CryptoJS.enc.Hex.stringify(hmac);
    };

    // Verify password length/type etz
    // TODO password requirements character-wise
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

        var NodeRSAKey = new NodeRSA({b: keySize});

        var tempPriv = NodeRSAKey.exportKey('private');
        var tempPub = NodeRSAKey.exportKey('public');

        return {
            'keySize': keySize,
            'privateKey': tempPriv,
            'publicKey': tempPub,
            'rsaObj': NodeRSAKey
        };
    };

}