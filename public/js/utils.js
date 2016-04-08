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