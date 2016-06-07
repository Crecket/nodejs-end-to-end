# nodejs-end-to-end
A simple (And probably insecure) attempt at end-to-end encryption using Javscript and NodeJS

## Requirements
- npm 
- bower
- node.js
- npm browserify 
- python (Used for node-bcrypt)

## Installation 
First create a file 'app-vars.js' in the root and enter your mysql password. Next, run the following commands

- npm run setup 
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
- Client1 sends request to Client2 that we want to chat
  -  Request is done by signing a simple message with Client1's private sign key so Client2 can verify it came from Client1
- Client2 verifies the signed signature using Client2's public verify key
- Client2 generates aes key and encrypts it with sender's public encryption key
- Server checks target/sender and sends data again to client1
- Client1 verifies the signature and payload

From now on client1 and client2 will use this aes key to communicate

## Message 
- Client1 checks if we have a aes key for Client2
- Encrypt message with aes key
- Send to Client2
- Client2 checks if we have a aes key for Client1
- Decrypt with the aes key

## SSL
For testing you can use self signed certificates. Run `npm run cert` to create a ssl certificate and private key.

## Issues/Todo

- #### Public key's could be faked by server
Could be solved by allowing users to enter their own public/private keys which they can than send over a different chat service. 
Only way to fix this is add client-side key storage and easily editable public keys for other clients

- #### Login scheme is flawed
SHA512 + unique salt which is created on register is created on login attempt. salt is now exposed to client

- #### Manual accept for aes request
Allow users to accept aes requests instead of allowing anyone to conenct with anyone.

- #### File sending
Send files in chunks

- #### Invalidate aes key
Allow users to invalidate aes keys manualy. Make sure the server invalidates aes keys when rsa keys have changed for either client.
