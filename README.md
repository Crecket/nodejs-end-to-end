# nodejs-end-to-end
A simple (And probably insecure) attempt at end-to-end encryption using Javscript and NodeJS

## Requirements
- npm 
- bower
- node.js
- npm browserify 
- python (Used for node-bcrypt)

## Installation commands
- npm run install 
- node app

## Rsa keys
All clients have 2 2048 bit size key sets which are generated on page load. 
##### Encryption
The first keyset is used for all encryption/decryption
##### Signing
The second keyset is used for signing/verifying signatures

## Verification 
- User enters name/password
- Server sends user's unique salt
- Password + salt hashed with SHA512 
- Encrypt with the server's public key (because we can, not because we have to)
- Check if user exsists by username
- Check if bcrypt(hashed_password, hashed_password_bcrypt) is true
- Add user to verified user list and send callback

## Aes setup
- Client1 sends request to client2 that we want to chat
  --  Request is done by signing a simple message with Client1's private sign key
- Client2 verifies the signed signature using client2's public verify key
- Client2 generates aes key and encrypts it with sender's public encryption key
- Server checks target/sender and sends data again to client1
- Client1 verifies the signature and payload

From now on client1 and client2 will use this aes key to communicate

## Message 


## SSL
For testing you can use self signed certificates. Run `npm run cert` to create a ssl certificate and private key.

## Issues/Todo

#### Public key's could be faked by server
Could be solved by allowing users to enter their own public/private keys which they can than send over a different chat service. 
Only way to fix this is add client-side key storage and easily editable public keys for other clients

#### Login scheme is flawed
SHA512 + unique salt which is created on register is created on login attempt. salt is now exposed to client

#### Verify aes requests
Verify through signing that request was made from certain person
