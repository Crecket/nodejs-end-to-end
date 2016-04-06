// Non-ssl
// var socket = io.connect('http://localhost:8000');

// Connect ssl sockets
var socket = io.connect('https://localhost:8000', {secure: true});

var CryptoHelper = new CryptoHelper();
var SessionHelper = new ConnectionHelper(socket, CryptoHelper);

var loading = false;

// Socket event listeners
socket.on('connect', function () {
    $('#messages').append('<li>Connected</li>');
}).on('request verify', function () {
    $('#login_screen').removeClass('hidden');
    $('#content').addClass('hidden');
}).on('login_attempt_callback', function (bool) {
    loading = false;
    $('#login_section').show();
    $('#login_button').removeClass('fa-spin fa-refresh').addClass('fa-sign-in');

});

// Login attempt
$(document.body).on('submit', '#login_form', function () {

    if (1 == 1 || !loading) {
        loading = true;
        var username = $('#inputName').val();
        var password = $('#inputPassword').val();

        $('#login_section').hide();
        $('#login_button').addClass('fa-spin fa-refresh').removeClass('fa-sign-in');

        if (username.length > 3 && username.length < 16 && password.length > 5 && password.length < 100) {

            setTimeout(function () {
                SessionHelper.loginAttempt(username, password);
            }, 100);

        } else {

            $('#login_section').show();
            $('#login_button').removeClass('fa-spin fa-refresh').addClass('fa-sign-in');

            console.log('Username length: ' + username.length + " password length: " + password);
        }
    }

    return false;
});