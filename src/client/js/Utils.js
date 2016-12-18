function escapeHtml(text) {
    'use strict';
    return text.replace(/[\"&'\/<>]/g, function (a) {
        return {
            '"': '&quot;', '&': '&amp;', "'": '&#39;',
            '/': '&#47;', '<': '&lt;', '>': '&gt;'
        }[a];
    });
}

function curDate() {
    var d = new Date();
    var hours = d.getHours();
    var minutes = d.getMinutes();
    var seconds = d.getSeconds();

    return (hours < 10 ? '0' : '') + hours + ":" +
        (minutes < 10 ? '0' : '') + minutes + ":" +
        (seconds < 10 ? '0' : '') + seconds;
}

function parseArray(data) {
    return JSON.parse(data);
}

function serializeArray(data) {
    return JSON.stringify(data);
}

function storageSet(key, value) {
    localStorage.setItem(key, value);
}

function storageGet(key) {
    return localStorage.getItem(key);
}

function storageDelete(key) {
    localStorage.removeItem(key);
}

// get input field value
function getFileContents(input_selector, callback) {
    // check support for file reader api
    if (!window.File || !window.FileReader || !window.FileList || !window.Blob) {
        error('The File APIs are not fully supported in this browser.');
        callback(false);
        return;
    }

    // get input element and check if file exists
    var file = getFileinfo(input_selector);
    if (!file) {
        warn('Invalid file upload or no file selected');
        callback(false);
        return;
    }

    // create file reader
    var fr = new FileReader();
    fr.onload = function () {
        // filereader ready callback
        $('#dataurltest').attr('href', fr.result);
        callback({
            'name': file.name,
            'size': file.size,
            'lastModified': file.lastModified,
            'type': file.type,
            'result': fr.result
        });
        fr = file = "";
    };
    //get file data as DataURL
    fr.readAsDataURL(file);
}

// only get file info from a input
function getFileinfo(input_selector) {
    var input = document.getElementById(input_selector);
    if (input && input.files && input.files[0]) {
        return input.files[0];
    }
    return false;
}

// turn large string into array with fixed with strings
function stringToPackage(data, size) {
    if (!size) {
        size = 1024 * 25; // 25kb
    }

    var offset = 0;
    var result = [];
    while (offset < data.length) {
        result.push(data.substr(offset, size));
        offset += size;
    }
    return result;
}

// reset a form element value E.G. file input fields
function resetFormElement(e) {
    e.wrap('<form>').closest('form').get(0).reset();
    e.unwrap();
}

function mapObject(object, callback) {
    return Object.keys(object).map(function (key) {
        return callback(key, object[key]);
    });
}

// console shortcuts
var warn = console.warn.bind(window.console),
    error = console.error.bind(window.console),
    log = console.log.bind(window.console),
    debug = console.debug.bind(window.console),
    info = console.info.bind(window.console);
