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
    $('#public_key_input').val(keys.publicKey);
    $('#private_key_input').val(keys.privateKey);
    updateChecksums();
});

// create new signing key set on startup
SessionHelper.newKeySetSign(function (keys) {
    $('#public_key_sign_input').val(keys.publicKeySign);
    $('#private_key_sign_input').val(keys.privateKeySign);
    updateChecksums();
});

var loginLoading = false;
var messageLoading = false;
var sendingFile = false;

setInterval(function () {
    // stay alive through heartbeat
    socket.emit('heart_beat', 'oi');
}, 5000);

// Socket event listeners
socket.on('connect', function () {
    info('Connected to server');
    $('#server_status').text('Connected');
    $('#server_status_icon').removeClass('fa-spin fa-refresh fa-warning').addClass('fa-check');
    $('#loader').fadeOut();
    $('#main').fadeIn();
});

// Disconnected from server
socket.on('disconnect', function () {
    error('Lost contact with server');

    $('#server_status').text('Disconnected');
    $('#server_status_icon').removeClass('fa-spin fa-refresh fa-check').addClass('fa-warning');
    $('#login_screen').show();
    $('#content').hide();
    $('#loader').fadeIn();
    $('#main').fadeOut();

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

    loadKeyListDiv();
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
    loginLoading = false;
    SessionHelper.loginAttemptCallback(res);
    if (res.success === false) {
        warn('Unsuccesful login attempt');
        // Invalid login attempt
        $('#login_section').show();
        $('#content').hide();
        $('#login_button').removeClass('fa-spin fa-refresh').addClass('fa-sign-in');
        $('#login_form_messages_div').text(res.message);
        $('#login_form_messages').fadeIn();
    } else {
        info('Succesful login attempt');
        $('#login_button').removeClass('fa-spin fa-refresh').addClass('fa-check');
        $('#login_form_messages').hide();
        $('#login_screen').fadeOut("slow", function () {
            $('#content').fadeIn();
        });
    }
    debug(res);
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
                $('#login_form_messages').fadeOut();
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
    } else {
        warn('Not verified, can\'t select target');
    }
    return false;
});

// file upload testing
$('#file_upload').on('click', function () {
    // check if no other file is being sent, if we have a target and if a aes key has been established
    if (!sendingFile && SessionHelper.hasTarget() && SessionHelper.hasAesKey()) {

        // basic file info
        var file_info = getFileinfo('file_upload_test');

        // 1b < file-size < 1mb
        if (file_info && file_info.size > 0 && file_info.size < 1024 * 1024) {

            // update status
            sendingFile = true;

            // button text update to loader icon
            $('#file_upload').html('<i class="fa fa-spin fa-refresh"></i>');

            // get contents from input
            getFileContents('file_upload_test', function (res) {
                log(res);
                var packages = stringToPackage(res.result, 1024 * 10);

                SessionHelper.sendFile(packages, function (result) {
                    log(result);
                    if (result === true) {
                        resetFormElement($('#file_upload_test'));
                        $('#file_upload').html('Send a file');
                        sendingFile = false;
                        addMessage(userName, 'File has succesfully been sent to the target');
                    } else if (result === false) {
                        resetFormElement($('#file_upload_test'));
                        $('#file_upload').html('Send a file');
                        addMessage(SessionHelper.getUsername(), 'File has NOT succesfully been sent to the target');
                        sendingFile = false;
                    } else {
                        // $('#file_upload').html('Progress: ' + Math.round(result) + '%');
                        $('#file_upload').html('Progress: ' + result.toFixed(2) + '%');
                    }
                });
            });
        } else {
            warn('Invalid file size, max file size is 5mb');
        }
    }
});

// create new encryption key set
$('#new_encryption_keypair').on('click', function () {
    SessionHelper.newKeySet(function (keys) {
        $('#public_key_input').val(keys.publicKey);
        $('#private_key_input').val(keys.privateKey);
        debug('Generated new encryption key set');
        updateChecksums();
    });
    return false;
});

// create new signing key set
$('#new_encryption_sign_keypair').on('click', function () {
    SessionHelper.newKeySetSign(function (keys) {
        $('#public_key_sign_input').val(keys.publicKeySign);
        $('#private_key_sign_input').val(keys.privateKeySign);
        debug('Generated new signing key set');
        updateChecksums();
    });
    return false;
});

// toggle div collapse
$('.body_toggle').on('click', function () {
    var targetDiv = $(this).data('toggle');
    $('#' + targetDiv).slideToggle();
});

// update hash values
$('#update_md5_hashes').on('click', function () {
    updateChecksums();
});

// update the md5 fingerprints for rsa keys
function updateChecksums() {
    debug('Updating checksums');
    $('#private_key_md5hash').text("Checksum: " + CryptoJS.SHA256($('#private_key_input').val()));
    $('#public_key_md5hash').text("Checksum: " + CryptoJS.SHA256($('#public_key_input').val()));
    $('#private_key_sign_md5hash').text("Checksum: " + CryptoJS.SHA256($('#private_key_sign_input').val()));
    $('#public_key_sign_md5hash').text("Checksum: " + CryptoJS.SHA256($('#public_key_sign_input').val()));
}

// local storage buttons
$('.save_set_data').on('click', function () {
    // get values for this element
    var save_key = $(this).data('save_key');
    var target_field = $(this).data('save_target_field');
    var value = $(target_field).val();
    // get the data for the given key
    storageSet(save_key, value);
});
$('.save_delete_data').on('click', function () {
    // get values for this element
    var remove_key = $(this).data('remove_key');
    // get the data for the given key
    storageDelete(remove_key);
});
$('.save_get_data').on('click', function () {
    // get values from data values
    var save_key = $(this).data('save_key');
    var target_field = $(this).data('save_target_field');
    // get the data for the given key
    $(target_field).val(storageGet(save_key));
});

// save and load keypairs for settings tab
$('.save_keypair').on('click', function () {
    if ($(this).data('type') === "encryption") {
        storageSet('encryption_private_key', $('#private_key_input').val());
        storageSet('encryption_public_key', $('#public_key_input').val());
    } else {
        storageSet('encryption_private_sign_key', $('#private_key_sign_input').val());
        storageSet('encryption_public_sign_key', $('#public_key_sign_input').val());
    }
});
$('.load_keypair').on('click', function () {
    if ($(this).data('type') === "encryption") {
        $('#private_key_input').val(storageGet('encryption_private_key'));
        $('#public_key_input').val(storageGet('encryption_public_key'));
    } else {
        $('#private_key_sign_input').val(storageGet('encryption_private_sign_key'));
        $('#public_key_sign_input').val(storageGet('encryption_public_sign_key'));
    }
});

// load aes key list divs
function loadKeyListDiv() {
    // create stored aes keys div
    var keyList = SessionHelper.getKeyList();
    var resultDiv = "";
    for (var key in keyList) {
        resultDiv +=
            '<div class="panel panel-primary">' +
            '<div class="panel-heading body_toggle">' +
            "Username: " + key +
            '</div>' +
            '<div class="panel-body">' +
            '<div class="col-xs-12">' +
            '<div class="row">' +
            '<label for="inputTarget">AES key</label>' +
            '<input class="form-control" type="text" value="' + keyList[key]['key'] + '">' +
            '</div>' +
            '</div>' +
            '<div class="col-xs-12 col-sm-6">' +
            '<div class="row">' +
            '<label for="inputTarget">Encryption key</label>' +
            '<textarea class="form-control key-text">' + keyList[key]['rsa_keys']['public_key'] + '</textarea>' +
            '<p>Checksum: ' + CryptoJS.SHA256(keyList[key]['rsa_keys']['public_key']).toString() + '</p>' +
            '</div>' +
            '</div>' +
            '<div class="col-xs-12 col-sm-6">' +
            '<div class="row">' +
            '<label for="inputTarget">Verification key</label>' +
            '<textarea class="form-control key-text">' + keyList[key]['rsa_keys']['public_key_sign'] + '</textarea>' +
            '<p>Checksum: ' + CryptoJS.SHA256(keyList[key]['rsa_keys']['public_key_sign']).toString() + '</p>' +
            '</div>' +
            '</div>' +
            '</div>' +
            '</div>';
    }
    $('#stored_key_div').html(resultDiv);
}