// var NodeRSA = require('node-rsa');
import NodeRSA from 'node-rsa';

export default class CryptoHelperV2 {
    // ======================== RSA ==========================

    // Create new RSA keyset, default keysize 1024 recommended
    createKeySet = (keySize) => {
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
    rsaEncrypt = (keySet, data) => {
        return keySet.encrypt(data, 'base64');
    };
    // Encrypt data using our private key
    rsaEncryptPriv = (keySet, data) => {
        return keySet.encryptPrivate(data, 'base64');
    };
    // Encrypt with a public key in pem format
    rsaEncryptPem = (inputPublickey, data) => {
        var NodeRSAObj = new NodeRSA(inputPublickey, 'pkcs8-public');
        return NodeRSAObj.encrypt(data, 'base64');
    };
    // Encrypt with a private key in pem format
    rsaEncryptPemPriv = (inputPrivatekey, data) => {
        var NodeRSAObj = new NodeRSA(inputPrivatekey, 'pkcs8-public');
        return NodeRSAObj.encryptPrivate(data, 'base64');
    };

    // ========= Decryption =========
    // Decrypt a cypher using our private key
    rsaDecrypt = (keySet, cypher) => {
        return keySet.decrypt(cypher, 'utf8');
    };
    // Decrypt a cypher using our public key
    rsaDecryptPub = (keySet, cypher) => {
        return keySet.decryptPublic(cypher, 'utf8');
    };
    // Decrypt with a private key in pem format
    rsaDecryptPem = (inputPrivatekey, data) => {
        var NodeRSAObj = new NodeRSA(inputPrivatekey, 'pkcs8-public');
        return NodeRSAObj.decrypt(data, 'utf8');
    };
    // Decrypt with a public key in pem format
    rsaDecryptPemPub = (inputPublickey, data) => {
        var NodeRSAObj = new NodeRSA(inputPublickey, 'pkcs8-public');
        return NodeRSAObj.decryptPublic(data, 'utf8');
    };

    // ========= Signing =========
    // Sign data with a keyset
    rsaSign = (keySet, data) => {
        return keySet.sign(data, 'hex', 'utf8');
    };
    // Verify data with a public key
    rsaVerify = (inputPublicKey, data, signature) => {
        var NodeRSAObj = new NodeRSA(inputPublicKey, 'pkcs8-public');
        return NodeRSAObj.verify(data, signature, 'utf8', 'hex');
    };

    // ======================== AES ==========================

    // generate a AES compatible Key
    newAesKey = (raw) => {
        return this.randomBytes(32, raw); // 32 * 8 bit = 256 bit
    };
    // generate a AES compatible IV, 16 or 32 byte
    newAesIv = (size, raw) => {
        if (!size) {
            size = 16; // 16 * 8 bit = 128 bit
        } else {
            if (size !== 16 && size !== 32) {
                size = 16;
            }
        }

        return this.randomBytes(size, raw);
    };


    // aes encryption with CBC mode
    aesEncrypt = (text, key, iv) => {

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
    aesDecrypt = (cipher, key, iv) => {

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

    // SHA512 hashing + salt
    hash = (text, salt) => {
        // Return binary as hex
        if (!salt) {
            salt = '';
        }
        return CryptoJS.enc.Hex.stringify(CryptoJS.SHA512(text + salt));
    };

    // MD5 hashing
    MD5 = (text) => {
        // Return binary as hex
        return CryptoJS.enc.Hex.stringify(CryptoJS.MD5(text));
    };

    // Verify password characters etz
    validPasswordType = (password) => {
        // atleast 8 characters but anything more than 512 is redundant
        if (password.length > 512) {
            return false;
        }
        return true;
    };

    // generate random hex string for given amount of bytes
    randomBytes = (length, raw) => {
        // generate random array
        var bytes = CryptoJS.lib.WordArray.random(length);
        if (raw) {
            return bytes;
        }
        return CryptoJS.enc.Hex.stringify(bytes);
    };
}