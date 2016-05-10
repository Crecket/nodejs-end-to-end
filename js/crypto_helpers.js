var NodeRSA = require('node-rsa');

function CryptoHelper() {
    var fn = this;

    // ======================== RSA ==========================

    // Create new RSA keyset, default keysize 1024 recommended
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

    // ========= Encryption =========
    // Encrypt data using our public key
    this.rsaEncrypt = function (keySet, data) {
        return keySet.encrypt(data, 'base64');
    };
    // Encrypt data using our private key
    this.rsaEncryptPriv = function (keySet, data) {
        return keySet.encryptPrivate(data, 'base64');
    };
    // Encrypt with a public key in pem format
    this.rsaEncryptPem = function (inputPublickey, data) {
        var NodeRSAObj = new NodeRSA(inputPublickey, 'pkcs8-public');
        return NodeRSAObj.encrypt(data, 'base64');
    };
    // Encrypt with a private key in pem format
    this.rsaEncryptPemPriv = function (inputPrivatekey, data) {
        var NodeRSAObj = new NodeRSA(inputPrivatekey, 'pkcs8-public');
        return NodeRSAObj.encryptPrivate(data, 'base64');
    };

    // ========= Decryption =========
    // Decrypt a cypher using our private key
    this.rsaDecrypt = function (keySet, cypher) {
        return keySet.decrypt(cypher, 'utf8');
    };
    // Decrypt a cypher using our public key
    this.rsaDecryptPub = function (keySet, cypher) {
        return keySet.decryptPublic(cypher, 'utf8');
    };
    // Decrypt with a private key in pem format
    this.rsaDecryptPem = function (inputPrivatekey, data) {
        var NodeRSAObj = new NodeRSA(inputPrivatekey, 'pkcs8-public');
        return NodeRSAObj.decrypt(data, 'utf8');
    };
    // Decrypt with a public key in pem format
    this.rsaDecryptPemPub = function (inputPublickey, data) {
        var NodeRSAObj = new NodeRSA(inputPublickey, 'pkcs8-public');
        return NodeRSAObj.decryptPublic(data, 'utf8');
    };

    // ========= Signing =========
    // Sign data with a keyset
    this.rsaSign = function (keySet, data) {
        return keySet.sign(data, 'hex', 'utf8');
    };
    // Verify data with a public key
    this.rsaVerify = function (inputPublicKey, data, signature) {
        var NodeRSAObj = new NodeRSA(inputPublicKey, 'pkcs8-public');
        return NodeRSAObj.verify(data, signature, 'utf8', 'hex');
    };

    // ======================== AES ==========================

    // generate a AES compatible Key
    this.newAesKey = function (raw) {
        return fn.randomBytes(32, raw); // 32 * 8 bit = 256 bit
    };
    // generate a AES compatible IV, 16 or 32 byte
    this.newAesIv = function (size, raw) {
        if (!size) {
            size = 16; // 16 * 8 bit = 128 bit
        } else {
            if (size !== 16 && size !== 32) {
                size = 16;
            }
        }

        return fn.randomBytes(size, raw);
    };


    // aes encryption with CBC mode
    this.aesEncrypt = function (text, key, iv) {

        // key fallback
        if (!key || !iv) {
            return false;
        }

        // encrypt text
        var encrypted = CryptoJS.AES.encrypt(
            text,
            key,
            {
                iv: iv,
                mode: CryptoJS.mode.CBC,
                padding: CryptoJS.pad.Pkcs7
            }
        );

        // turn raw data into Base64 string
        return encrypted.toString();
    };
    // aes decryption with CBC mode
    this.aesDecrypt = function (cipher, key, iv) {

        // key fallback
        if (!key || !iv || !cipher) {
            return false;
        }

        // decrypt cipher with key and iv
        var decrypted = CryptoJS.AES.decrypt(
            cipher,
            key,
            {
                iv: iv,
                mode: CryptoJS.mode.CBC,
                padding: CryptoJS.pad.Pkcs7
            }
        );

        // Return decrypted text
        return decrypted.toString(CryptoJS.enc.Utf8);
    };

    // ======================== Hashing ==========================

    // SHA512 hashing
    this.hash = function (text) {
        // Return binary as hex
        return CryptoJS.enc.Hex.stringify(CryptoJS.SHA512(text));
    };

    // Verify password length/type etz
    // TODO password requirements character-wise
    this.validPasswordType = function (password) {
        if (password.length < 0 || password.length > 512) {
            return false;
        }
        return true;
    };

    // generate random hex string for given amount of bytes
    this.randomBytes = function (length, raw) {
        // generate random array
        var bytes = CryptoJS.lib.WordArray.random(length);
        if (raw) {
            return bytes;
        }
        return CryptoJS.enc.Hex.stringify(bytes);
    };
}