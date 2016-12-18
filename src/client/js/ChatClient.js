import CryptoHelper from './CryptoHelperV2';

// Create new helper object
var CryptoHelperLib = new CryptoHelper();

export default class ChatClient {

    constructor(socket) {
        // set the this.socket
        this.socket = this.socket;

        // current username
        this.username = false;
        // boolean wheter this client is verified or not
        this.verified = false;

        // ===========================================

        // Full key set, used for decryption/encryption
        this.keySet = false;
        // This client's private key, only used for exporting
        this.privateKey = false;
        // This client's public key, only used for exporting
        this.publicKey = false;

        // ===========================================

        // Full key set, used for signing/verification
        this.keySetSign = false;
        // This client's private key, only used for exporting Sign key
        this.privateKeySign = false;
        // This client's public key, only used for exporting Sign key
        this.publicKeySign = false;

        // ===========================================

        // NodeJS public key
        this.serverPublicKey = false;

        // List off all user's and their rsa public keys
        this.userList = {};
        // stored aes keys for different users
        this.storedKeys = {};

        // username of current target for chat messages
        this.targetName = false;
        // Public key of current target for chat messages
        this.targetKey = false;

        // default setting whether this client wishes to receive files or not
        this.allowFiles = false;

        // shitty fix to store passwords while waiting for the salt
        this.tempPassword = "";
        this.tempUsername = "";

    }

    // Attempt to verify username with server
    loginAttempt = (username, password) => {
        // Temporarily store password in var
        this.tempPassword = password;
        this.tempUsername = this.username;

        // Send attempt to server
        this.socket.emit('request_salt', this.username);
    };

    // Salt Callback for login attempt
    loginSaltCallback = (salt) => {

        // Hash password before submitting
        var passwordHash = CryptoHelperLib.hash(this.tempPassword, salt);

        // Encrypt with server's public key
        var passwordCipher = CryptoHelperLib.rsaEncryptPem(this.serverPublicKey, passwordHash);

        // Send attempt to server
        this.socket.emit('login_attempt', this.tempUsername, passwordCipher);

        // unset temp values
        this.tempPassword = "";
        this.tempUsername = "";
    };

    // call back from login attempt
    loginAttemptCallback = (res) => {
        if (res.success !== false) {
            this.verified = true;
            this.username = res.username;
            this.updateKey();
            if (res.jwtToken) {
                storageSet('token', res.jwtToken);
            }
        }
    };

    // set login based on server jwt response
    jwtLoginCallback = (res) => {
        if (res.success !== false) {
            this.verified = true;
            this.username = res.username;
            this.updateKey();
            return true;
        } else {
            // delete the existing token since it is not valid
            storageDelete('token');
            debug('Deleting invalid jwt token');
        }
        return false;
    };

    // Decrypt a cypher by using the created aes key
    receiveMessage = (receivedData, callback) => {
        info('Received message');
        debug(receivedData);

        var message = false;
        if (this.storedKeys[receivedData.from]) {
            // Decrypt with the sender's aes key
            message = CryptoHelperLib.aesDecrypt(receivedData.cypher, this.storedKeys[receivedData.from]['key'], receivedData.iv);
        }

        callback(message);
    };

    // Send a message if user is verified
    sendMessage = (message) => {
        if (this.isVerified() && this.hasTarget()) {

            // random iv for every encryption
            var iv = CryptoHelperLib.newAesIv();

            // Encryp with a stored aes key
            var messageCypher = CryptoHelperLib.aesEncrypt(message, this.targetKey, iv);

            // send the cypher and iv to target
            var messageData = {
                'cypher': messageCypher,
                'iv': iv,
                'target': this.targetName,
                'from': this.username
            };
            this.socket.emit('message', messageData);
            info('Sending message to ' + this.targetName);
            debug(message, messageData);
            return true;
        }
        return false;
    };

    // if user is verified, send the server the current key
    updateKey = () => {
        if (this.verified) {
            debug('Sending public key to server');
            // log(publicKey, publicKeySign);
            this.socket.emit('public_key', {'publicKey': this.publicKey, 'publicKeySign': this.publicKeySign});
        }
    };

    // Update the user list and check if current target is still available
    updateUserList = (newUserList) => {
        this.userList = newUserList;
        // check if target still exists
        if (!this.userList[this.targetName]) {
            // not found, remove the target
            this.targetKey = false;
            delete this.storedKeys[this.targetName];
            this.targetName = false;
            return false;
        }
        return true;
    };

    // set the server's public key
    setServerPublicKey = (key) => {
        this.serverPublicKey = key;
    };

    // request a new aes key from a target
    requestAesKey = (target) => {
        debug('Aes key request for ' + target);

        // for verification
        var signature = CryptoHelperLib.rsaSign(this.keySetSign, 'Aes request from: ' + this.username);

        this.socket.emit('request_aes', {'target': target, 'from': this.username, 'signature': signature});
    };

    // store a aes key and iv after other client sends it
    setAesKey = (response, callback) => {
        var result = false;
        if (response.success) {

            // get the sender's data
            if (this.userList[response.from] && this.userList[response.from]['public_key_sign']) {

                // get the sender's public key from the stored user list
                var senderPublicKey = this.userList[response.from]['public_key_sign'];

                // Next decrypt with our own private key
                var serializedData = CryptoHelperLib.rsaDecrypt(this.keySet, response.cypher);

                // verify rsa signed signature
                // TODO timestamp
                if (CryptoHelperLib.rsaVerify(senderPublicKey, serializedData, response.signature)) {

                    // parse data
                    var normalData = parseArray(serializedData);

                    // verify iv and key
                    if (normalData.key.length === 64) {

                        // store the key
                        this.storedKeys[response.from] = {
                            'key': normalData.key,
                            'rsa_keys': this.userList[response.from]
                        };
                        this.targetName = response.from;
                        result = true;
                        info('AES request is valid, key has been stored');

                        // send a confirmation message to the other client
                        var confirmIv = CryptoHelperLib.newAesIv();
                        // message to encrypt and sign
                        var confirmMessage = SessionHelper.getUsername() + ' confirms this key';
                        // sign and encrypt the message
                        var payload = {
                            'cypher': CryptoHelperLib.aesEncrypt(confirmMessage, normalData.key, confirmIv),
                            'iv': confirmIv,
                            'signature': CryptoHelperLib.rsaSign(this.keySetSign, confirmMessage),
                            'success': true,
                            'from': this.username,
                            'target': response.from
                        };
                        this.socket.emit('confirm_aes', payload);
                    } else {
                        warn('AES key is invalid length');
                    }
                } else {
                    warn('AES response signature is invalid.');
                }
            } else {
                warn('We have no RSA key to verify this response');
            }
        }
        callback(result);
    };

    // create a new aes key and iv to use after other client requests it

    createNewAes = (request) => {
        if (this.userList[request.from] && this.userList[request.from]['public_key']) {
            // get the sender's public key from the stored user list
            var senderPublickey = this.userList[request.from]['public_key'];
            var senderPublickeySign = this.userList[request.from]['public_key_sign'];

            // This is the expected message if it was sent from this user.
            var payLoad = "Aes request from: " + request.from;

            // first verify that the request was actually sent by the 'from' user
            // TODO timestamp
            if (CryptoHelperLib.rsaVerify(senderPublickeySign, payLoad, request.signature)) {

                // generate new random iv and key
                var key = CryptoHelperLib.newAesKey();

                // store the key and iv
                this.storedKeys[request.from] = {'key': key, 'rsa_keys': this.userList[request.from]};

                // serialize the data we want to send
                var responseSerialized = serializeArray({'key': key});

                // create a signature for our payload
                var signature = CryptoHelperLib.rsaSign(this.keySetSign, responseSerialized);

                // encryp with sender's public key
                var cypherResult = CryptoHelperLib.rsaEncryptPem(senderPublickey, responseSerialized);

                // send to the server
                var payload = {
                    'cypher': cypherResult,
                    'signature': signature,
                    'success': true,
                    'from': this.username,
                    'target': request.from
                };
                this.socket.emit('response_aes_request', payload);
                info('AES request request is valid');
                debug("Request", request);
                debug("Response", payload);
            } else {
                var payload = {
                    'success': false,
                    'message': "The signature does not seem to be from the right person",
                    'from': this.username,
                    'target': request.from
                };
                this.socket.emit('response_aes_request', payload);
                warn(request.from + "'s aes request contained a invalid signature");
                debug("Request", request);
                debug("Response", payload);
            }
        } else {
            warn('We have no RSA keys for this target');
        }
    };

    // TODO verification that both users have same key
    // check if key and iv are setup propperly after setting them up

    aesConfirmation = (response, callback) => {
        var resultMessage = "invalid";

        // check if we have a stored key
        if (this.storedKeys[response.from]) {

            // Decrypt with the sender's aes key
            var confirmMessage = CryptoHelperLib.aesDecrypt(response.cypher, this.storedKeys[response.from]['key'], response.iv);

            // get the sender's public key from the stored user list
            var senderPublicKey = this.userList[response.from]['public_key_sign'];

            // if we have both a public key and we succesfully decrypted the test message
            if (senderPublicKey && confirmMessage) {
                // TODO timestamp
                if (CryptoHelperLib.rsaVerify(senderPublicKey, confirmMessage, response.signature)) {
                    resultMessage = 'valid';
                }
            }
        }

        var packageData = {
            'from': this.username,
            'target': response.from,
            'message': resultMessage,
            'signature': CryptoHelperLib.rsaSign(this.keySetSign, resultMessage)
        };
        this.socket.emit('confirm_aes_response', packageData);

        if (resultMessage === "valid") {
            info('AES confirmation was succesful');
            callback(true);
        } else {
            warn('AES confirmation failed, removing key');
            delete this.storedKeys[response.from];
            callback(false);
        }
    }

    // a response after the other client has confirmed the aes confirmation request

    aesConfirmationResponse = (response, callback) => {

        // check if we have a stored key
        if (this.storedKeys[response.from]) {

            // get the sender's public key from the stored user list
            var senderPublicKey = this.userList[response.from]['public_key_sign'];

            // if we have both a public key and we succesfully decrypted the test message
            if (senderPublicKey) {
                // TODO timestamp
                if (CryptoHelperLib.rsaVerify(senderPublicKey, response.message, response.signature)) {

                    if (response.message === "valid") {
                        info('AES confirmation response was succesful and valid');
                        return callback(true);
                    } else {
                        warn('AES confirmation response was succesful but invalid');
                        delete this.storedKeys[response.from];
                        return callback(false);
                    }
                }
            }
        }
    }

    // create a new key set for this client
    newKeySet = (callback) => {
        info('Creating new rsa key set for encryption');
        var newKeyData = CryptoHelperLib.createKeySet(1024);
        this.keySet = newKeyData.rsaObj;
        this.privateKey = newKeyData.privateKey;
        this.publicKey = newKeyData.publicKey;

        if (callback) {
            callback({'privateKey': this.privateKey, 'publicKey': this.publicKey});
        }
        this.updateKey();
    };

    // create a new key set for this client
    newKeySetSign = (callback) => {
        info('Creating new rsa key set for signing');
        var newKeyData = CryptoHelperLib.createKeySet(1024);
        this.keySetSign = newKeyData.rsaObj;
        this.privateKeySign = newKeyData.privateKey;
        this.publicKeySign = newKeyData.publicKey;

        if (callback) {
            callback({'privateKeySign': this.privateKeySign, 'publicKeySign': this.publicKeySign});
        }
        this.updateKey();
    };

    // return if this private verified variable is true/false
    isVerified = () => {
        return this.verified !== false;
    };

    // check if we have a stored aes key for a given username
    hasAesKey = (target) => {
        if (!target) {
            // no custom target, use default target
            target = this.targetName;
        }
        if (this.storedKeys[target]) {
            return true;
        }
        return false;
    }

    // return current username
    getUsername = () => {
        return this.username;
    };

    // remove all aes keys
    resetUserList = () => {
        this.storedKeys = {};
    };
    // return the key list
    getKeyList = () => {
        return this.storedKeys;
    }

    // check if target is set
    hasTarget = () => {
        return this.getTarget() !== false;
    };
    // set the new target name and public key
    setTarget = (newTarget) => {
        // check if user is verified, exists and target is not self
        if (this.isVerified() && typeof this.userList[newTarget] !== "undefined" && newTarget !== this.username) {
            // check if we already have a aes key
            if (this.storedKeys[newTarget]) {
                // we have a stored key, set the iv/key
                this.targetKey = this.storedKeys[newTarget]['key'];
                this.targetName = newTarget;
                debug('Setting target to: ' + newTarget);
                return true;
            } else {
                // we dont have a stored key, request a new one from target
                fn.requestAesKey(newTarget);
            }
        }
        return false;
    };
    // get current target name
    getTarget = () => {
        return this.targetName;
    };

    // get allow file transfer setting
    getFileSetting = () => {
        return this.allowFiles;
    };
    // set allow file transfer setting
    setFileSetting = (boolean) => {
        this.allowFiles = boolean;
        if (boolean) {
            debug('You can now send and receive files');
        } else {
            debug('You can no longer send and receive files')
        }
    };
}