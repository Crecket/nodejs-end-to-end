# nodejs-end-to-end
A simple (And probably insecure) attempt at end-to-end encryption using Javscript and NodeJS

This project is just a test project to try out libraries and different setups and shouldn't be used in production.

Demo can be found here: https://crecket.me:8888/ 

## Requirements
- node.js
- npm 
- python (Used for node-bcrypt)

## Installation 
First create a file 'config.js' in the src/server/configs and enter your options. Next, run the following commands

- npm run setup 
- node app

## Commands list
- `npm run start` : Runs the node.js server
- `npm run setup` : Runs all required commands for the initial setup
- `npm run build` : Webpack script that compiles the files and creates a production ready app
- `npm run dev` : Start webpack in development mode and enable a watcher
- `npm run cert` : Creates RSA and SSL certificates to be used in the application, only use these certificates for debugging

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
