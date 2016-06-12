// Create socket connection
var socket = io.connect('https://' + window.location.host, {secure: true});

// console shortcuts
var warn = console.warn.bind(window.console),
    error = console.error.bind(window.console),
    log = console.log.bind(window.console),
    debug = console.debug.bind(window.console),
    info = console.info.bind(window.console);

// Create crypto and session helpers
var CryptoHelper = new CryptoHelper();
var SessionHelper = new ConnectionHelper(socket, CryptoHelper);

// Custom heartbeat for the socket connection
setInterval(function () {
    socket.emit('heart_beat', 'oi');
}, 5000);
