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