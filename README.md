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
- npm browserify package

## Installation commands

- npm install
- bower install
- npm install -g browserify (Only if you havn't already installed it)
- browserify -r node-rsa > ./public/js/node-bundle.js
- node app
