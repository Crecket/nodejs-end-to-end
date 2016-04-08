# nodejs-end-to-end
A simple (And probably insecure) attempt at end-to-end encryption using Javscript and NodeJS

// TODO
hmac-sha256 to verify the username with nodejs server

rsa pub/priv keys to send and receive messages in 1 on 1 chat

session fix

## Requirements
- npm 
- bower
- node.js
- npm browserify package (npm install -g browserify)

## Installation commands

- npm install (runs all required install/update commands)
- node app



## Verification 

- User enters name/password
- Password hashed with HMAC-SHA26 with the password as salt (Bad practise obviously)
- Encrypt with the server's public key
- Check if user exsists by username
- Check if bcrypt(hashed_password, hashed_password_bcrypt) is true
- Add user to verified user list and send callback

## Message 

- Client checks if user is logged in
- Client encrypts message with own private key
- Client encrypts cypher with target public key
- Message is sent to the server
- Server checks if user is logged in
- Message is sent to the client
- Client decrypts with own private key
- Client decrypts with sender public key
- Message is shown

