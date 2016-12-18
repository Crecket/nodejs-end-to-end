// Create socket connection
var socket = io.connect('https://' + window.location.host, {secure: true});

// Create crypto and session helpers
var CryptoHelper = new CryptoHelper();
var SessionHelper = new ConnectionHelper(socket, CryptoHelper);

