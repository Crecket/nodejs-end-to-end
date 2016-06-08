// Connect ssl sockets
$('#content').hide();

var socket = io.connect('https://' + window.location.host, {secure: true});
var debugSetting = true;
var warn = console.warn.bind(window.console),
    error = console.error.bind(window.console),
    log = console.log.bind(window.console),
    debug = console.debug.bind(window.console),
    info = console.info.bind(window.console);
var loginLoading = false,
    messageLoading = false,
    sendingFile = false;
var serverTime;
var CryptoHelper = new CryptoHelper();
var SessionHelper = new ConnectionHelper(socket, CryptoHelper);

setInterval(function () {
    // stay alive through heartbeat
    socket.emit('heart_beat', 'oi');
}, 5000);

// file transfer setting checkbox
$('#file_upload_setting').on('click', function () {
    SessionHelper.setFileSetting(this.checked);
    $("#messages_file_transfer_div").toggle(this.checked);
    socket.emit('')
});

// TODO consent before file sharing
// file upload testing
$('#file_upload').on('click', function () {
    // check if no other file is being sent, if we have a target and
    // if a aes key has been established and if we allow file transfers
    if (!sendingFile && SessionHelper.hasTarget() && SessionHelper.hasAesKey() && SessionHelper.getFileSetting()) {

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
                var packages = stringToPackage(res.result, 1024 * 10);

                SessionHelper.sendFile(packages, function (result) {
                    log(result);
                    if (result === true) {
                        resetFormElement($('#file_upload_test'));
                        $('#file_upload').html('Send a file');
                        addMessage(SessionHelper.getUsername(), 'File has succesfully been sent a to ' + SessionHelper.getTarget());
                        sendingFile = false;

                    } else if (result === false) {
                        resetFormElement($('#file_upload_test'));
                        $('#file_upload').html('Send a file');
                        addMessage(SessionHelper.getUsername(), 'File has NOT succesfully been sent a to ' + SessionHelper.getTarget());
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
    } else {
        debug(sendingFile, SessionHelper.hasTarget(), SessionHelper.hasAesKey());
        warn('Already sending file or no target/key');
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
            '<p class="checksum-text">Checksum: ' + CryptoJS.SHA256(keyList[key]['rsa_keys']['public_key']).toString() + '</p>' +
            '</div>' +
            '</div>' +
            '<div class="col-xs-12 col-sm-6">' +
            '<div class="row">' +
            '<label for="inputTarget">Verification key</label>' +
            '<textarea class="form-control key-text">' + keyList[key]['rsa_keys']['public_key_sign'] + '</textarea>' +
            '<p class="checksum-text">Checksum: ' + CryptoJS.SHA256(keyList[key]['rsa_keys']['public_key_sign']).toString() + '</p>' +
            '</div>' +
            '</div>' +
            '</div>' +
            '</div>';
    }
    $('#stored_key_div').html(resultDiv);
}

// update the md5 fingerprints for rsa keys
function updateChecksums() {
    debug('Updating checksums');
    $('#private_key_md5hash').text("Checksum: " + CryptoJS.SHA256($('#private_key_input').val()));
    $('#public_key_md5hash').text("Checksum: " + CryptoJS.SHA256($('#public_key_input').val()));
    $('#private_key_sign_md5hash').text("Checksum: " + CryptoJS.SHA256($('#private_key_sign_input').val()));
    $('#public_key_sign_md5hash').text("Checksum: " + CryptoJS.SHA256($('#public_key_sign_input').val()));
}