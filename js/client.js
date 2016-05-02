// Connect ssl sockets

$('#content').hide();

var socket = io.connect('https://' + window.location.host, {secure: true});

var debugSetting = true;

if (!debugSetting) {
    $('#debug_panel').hide();
}

var warn = console.warn.bind(window.console);
var error = console.error.bind(window.console);
var log = console.log.bind(window.console);
var debug = console.debug.bind(window.console);
var info = console.info.bind(window.console);

// crypto and session helper init
var CryptoHelper = new CryptoHelper();
var SessionHelper = new ConnectionHelper(socket, CryptoHelper);

// create new encryption key set on startup
SessionHelper.newKeySet(function (keys) {
    $('#public_key_input').text(keys.publicKey);
    $('#private_key_input').text(keys.privateKey);
    updateMd5Hashes();
});

// create new signing key set on startup
SessionHelper.newKeySetSign(function (keys) {
    $('#public_key_sign_input').text(keys.publicKeySign);
    $('#private_key_sign_input').text(keys.privateKeySign);
    updateMd5Hashes();
});

var loginLoading = false;
var messageLoading = false;

setInterval(function () {
    // stay alive through heartbeat
    socket.emit('heart_beat', 'oi');
}, 5000);

// Socket event listeners
socket.on('connect', function () {
    info('Connected to server');
    $('#server_status').text('Connected');
    $('#server_status_icon').removeClass('fa-spin fa-refresh fa-warning').addClass('fa-check');
});

// Disconnected from server
socket.on('disconnect', function () {

    error('Lost contact with server');

    $('#server_status').text('Disconnected');
    $('#server_status_icon').removeClass('fa-spin fa-refresh fa-check').addClass('fa-warning');

    $('#login_screen').show();
    $('#content').hide();

    SessionHelper.resetUserList();
});

// Receive server info, userlist
socket.on('server_info', function (server_info) {

    var user_list = server_info.user_list;

    // Update the public key list
    if (!SessionHelper.updateUserList(user_list)) {
        // current target is gone so reset the target input box
        $('#inputTarget').val('');
    }

    $('#user_list').html('');
    for (var key in user_list) {

        var UserIcon = "<i class='fa fa-unlock'></i>";
        // check if we have a stored aes key for this user, if yes add it
        if (SessionHelper.hasAesKey(user_list[key].username)) {
            UserIcon = "<i class='fa fa-lock'></i> ";
        }
        if (SessionHelper.getUsername() === user_list[key].username) {
            UserIcon = "<i class='fa fa-user'></i> ";
        }

        $('#user_list').append('<li><a href="#" class="user-select" data-user="' +
            user_list[key].username + '">' + UserIcon + user_list[key].username + '</a></li>');
    }
});

// Receive public key from server
socket.on('public_key', function (response) {
    SessionHelper.setServerPublicKey(response);
});

// Server requests verification
socket.on('request verify', function () {
    $('#login_screen').show();
    $('#content').hide();
});

// Login result callback
socket.on('login_attempt_callback', function (res) {

    debug('Login callback ' + res.success);

    loginLoading = false;

    SessionHelper.loginAttemptCallback(res);

    if (res.success === false) {
        // Invalid login attempt
        $('#login_section').show();
        $('#content').hide();
        $('#login_button').removeClass('fa-spin fa-refresh').addClass('fa-sign-in');

    } else {

        $('#login_button').removeClass('fa-spin fa-refresh').addClass('fa-check');
        $('#login_screen').fadeOut("slow", function () {
            $('#content').fadeIn();
        });

    }

});

// Server returns the user's salt
socket.on('login_salt_callback', function (salt) {
    debug('Salt callback');
    // send to session handler
    SessionHelper.loginSaltCallback(salt);
});

// Message server callback
socket.on('message_callback', function (res) {
    messageLoading = false;
    $('#message_button').removeClass('fa-spin fa-refresh').addClass('fa-mail-forward');
});

// Received a message from server
socket.on('message', function (res) {
    SessionHelper.receiveMessage(res, function (callbackMessage) {
        if (callbackMessage !== false) {
            addMessage(res.from, callbackMessage);
        }
    });
});

// someone wants to chat and is requesting that we create a new aes key to use
socket.on('aesKeyRequest', function (request) {
    info('Received AES request');
    SessionHelper.createNewAes(request);
});

// the client a aes key was requested from has sent a response
socket.on('aesKeyResponse', function (response) {
    SessionHelper.setAesKey(response);
    setTimeout(function () {
        info('Received AES response', response);
    }, 200);
});

function addMessage(username, text) {
    debug(username + ' Message: ' + text);
    if (text) {
        if (SessionHelper.getUsername() === username) {
            $('#messages').prepend('<p><strong>' + curDate() + " - " + escapeHtml(username) + "</strong>: " + escapeHtml(text) + '</p>');
        } else {
            $('#messages').prepend('<p>' + curDate() + " - " + escapeHtml(username) + ": " + escapeHtml(text) + '</p>');
        }
    }
}

// Login attempt
$(document.body).on('submit', '#login_form', function () {

    if (!loginLoading) {
        loginLoading = true;

        var username = $('#inputName').val();
        var password = $('#inputPassword').val();

        $('#login_button').addClass('fa-spin fa-refresh').removeClass('fa-sign-in');

        if (username.length > 3 && username.length < 16 && CryptoHelper.validPasswordType(password)) {

            setTimeout(function () {
                debug('Login attempt');
                SessionHelper.loginAttempt(username, password);
            }, 100);

        } else {
            $('#login_button').removeClass('fa-spin fa-refresh').addClass('fa-sign-in');
            warn('Username length: ' + username.length + " password length: " + password.length);
            loginLoading = false;
        }
    }

    return false;
});

// Message attempt
$(document.body).on('submit', '#message_form', function (e) {
    e.preventDefault();

    if (!messageLoading && SessionHelper.hasTarget()) {
        messageLoading = true;
        var message = $('#inputMessage').val().trim();

        $('#inputMessage').val('');

        $('#message_button').addClass('fa-spin fa-refresh').removeClass('fa-mail-forward');

        if (message.length > 0 && message.length < 255) {
            if (SessionHelper.sendMessage(message)) {
                addMessage(SessionHelper.getUsername(), message);
            }
        } else {
            $('#message_button').removeClass('fa-spin fa-refresh').addClass('fa-mail-forward');
            debug('Message length: ' + message.length);
            messageLoading = false;
        }
    }

    return false;
});

// select a user
$(document.body).on('click', '.user-select', function () {
    if (SessionHelper.isVerified()) {
        var userName = $(this).data('user');
        if (SessionHelper.setTarget(userName)) {
            $('#inputTarget').val(userName);
        }
    }
    return false;
});

// create new encryption key set
$('#new_encryption_keypair').on('click', function () {
    SessionHelper.newKeySet(function (keys) {
        $('#public_key_input').text(keys.publicKey);
        $('#private_key_input').text(keys.privateKey);
        debug('Generated new encryption key set');
        updateMd5Hashes();
    });
    return false;
});

// create new signing key set
$('#new_encryption_sign_keypair').on('click', function () {
    SessionHelper.newKeySetSign(function (keys) {
        $('#public_key_sign_input').text(keys.publicKeySign);
        $('#private_key_sign_input').text(keys.privateKeySign);
        debug('Generated new signing key set');
        updateMd5Hashes();
    });
    return false;
});

// toggle div collapse
$('.body_toggle').on('click', function () {
    var targetDiv = $(this).data('toggle');
    $('#' + targetDiv).slideToggle();
});

// update hash values
$('#update_md5_hashes').on('click', function(){
    updateMd5Hashes();
});

// update the md5 fingerprints for rsa keys
function updateMd5Hashes() {
    debug('Updating md5 hashes');
    $('#private_key_md5hash').text("MD5: " + CryptoJS.MD5($('#private_key_input').val()));
    $('#public_key_md5hash').text("MD5: " + CryptoJS.MD5($('#public_key_input').val()));
    $('#private_key_sign_md5hash').text("MD5: " + CryptoJS.MD5($('#private_key_sign_input').val()));
    $('#public_key_sign_md5hash').text("MD5: " + CryptoJS.MD5($('#public_key_sign_input').val()));
}


