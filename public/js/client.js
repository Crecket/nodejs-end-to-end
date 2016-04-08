// Connect ssl sockets

var socket = io.connect('https://' + window.location.host, {secure: true});

var debugSetting = true;

if (!debugSetting) {
    $('#debug_panel').hide();
}

function debug(message) {
    if (debugSetting) {
        console.log(message);
        if (Object.prototype.toString.call(message) == '[object String]') {
            $('#debug_list').prepend("<li><strong>DEBUG</strong>" +
                ": " + escapeHtml(message) + '</li>');
        }
    }
}

var CryptoHelper = new CryptoHelper();
var SessionHelper = new ConnectionHelper(socket, CryptoHelper);

var loginLoading = false;
var messageLoading = false;

$('#content').hide();

// Socket event listeners
socket.on('connect', function () {

    debug('Connected to server');

}).on('disconnect', function () {

    $('#login_screen').show();
    $('#content').hide();

}).on('server_info', function (server_info) {

    var user_list = server_info.user_list;

    $('#user_list').html('');
    for (var key in user_list) {
        $('#user_list').append('<li>' + user_list[key].username + '</li>');
    }

}).on('public_key', function (response) {

    // Receive public key from server
    SessionHelper.serverPublicKey = response;

}).on('request verify', function () {

    $('#login_screen').show();
    $('#content').hide();

}).on('login_attempt_callback', function (res) {

    loginLoading = false;

    SessionHelper.loginAttemptCallback(res);

    if (res.success === false) {
        $('#login_section').show();
        $('#content').hide();
        $('#login_button').removeClass('fa-spin fa-refresh').addClass('fa-sign-in');
    } else {
        $('#login_button').removeClass('fa-spin fa-refresh').addClass('fa-check');
        $('#content').show();
        $('#login_screen').fadeOut();
    }

}).on('message_callback', function (res) {

    messageLoading = false;
    $('#message_button').removeClass('fa-spin fa-refresh').addClass('fa-mail-forward');

}).on('message', function (res) {

    addMessage(res.username, SessionHelper.receiveMessage(res.message));

});

function addMessage(username, text) {
    debug('Message: ' + text);
    $('#messages').prepend('<li><strong>' + escapeHtml(username) + "</strong>: " + escapeHtml(text) + '</li>');
}

function escapeHtml(text) {
    'use strict';
    return text.replace(/[\"&'\/<>]/g, function (a) {
        return {
            '"': '&quot;', '&': '&amp;', "'": '&#39;',
            '/': '&#47;', '<': '&lt;', '>': '&gt;'
        }[a];
    });
}

// Login attempt
$(document.body).on('submit', '#login_form', function () {

    if (!loginLoading) {
        loginLoading = true;

        var username = $('#inputName').val();
        var password = $('#inputPassword').val();

        $('#login_section').hide();
        $('#login_button').addClass('fa-spin fa-refresh').removeClass('fa-sign-in');

        if (username.length > 3 && username.length < 16 && CryptoHelper.validPasswordType(password)) {

            setTimeout(function () {
                SessionHelper.loginAttempt(username, password);
            }, 100);

        } else {

            $('#login_section').show();
            $('#login_button').removeClass('fa-spin fa-refresh').addClass('fa-sign-in');

            debug('Username length: ' + username.length + " password length: " + password);
            loginLoading = false;
        }
    }

    return false;
});

// Message attempt
$(document.body).on('submit', '#message_form', function (e) {
    e.preventDefault();

    if (!messageLoading) {
        messageLoading = true;
        var message = $('#inputMessage').val().trim();

        $('#inputMessage').val('');

        $('#message_button').addClass('fa-spin fa-refresh').removeClass('fa-mail-forward');

        if (message.length > 0 && message.length < 255) {
            SessionHelper.sendMessage(message);
        } else {
            $('#message_button').removeClass('fa-spin fa-refresh').addClass('fa-mail-forward');
            debug('Message length: ' + message.length);
            messageLoading = false;
        }
    }

    return false;
});