var gulp = require('gulp'),
    gp_concat = require('gulp-concat'),
    gp_rename = require('gulp-rename'),
    gp_uglify = require('gulp-uglify'),
    gp_sourcemaps = require('gulp-sourcemaps');

gulp.task('js-main', function(){
    return gulp.src([
        'public/bower_components/jquery/dist/jquery.min.js',
        'public/bower_components/socket.io-client/socket.io.js',
        'public/bower_components/sjcl/sjcl.js',
        'public/bower_components/cryptojslib/components/core.js',
        'public/bower_components/cryptojslib/components/hmac.js',
        'public/bower_components/cryptojslib/components/sha256.js',
        'public/bower_components/cryptojslib/components/enc-base64.js',
        'public/js/node-bundle.js',
        '/js/utils.js',
        '/js/crypto_helpers.js',
        '/js/session_helper.js',
        '/js/client.js',
    ])
        .pipe(gp_sourcemaps.init())
        .pipe(gp_concat('main_package.js'))
        .pipe(gulp.dest('public/dist'))
        .pipe(gp_rename('main_package.min.js'))
        .pipe(gp_uglify())
        .pipe(gp_sourcemaps.write('./'))
        .pipe(gulp.dest('public/dist'));
});

gulp.task('default', ['js-main'], function(){});