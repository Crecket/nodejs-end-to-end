var gulp = require('gulp');
var concat = require('gulp-concat');
var rename = require('gulp-rename');
var uglify = require('gulp-uglify');
var sourcemaps = require('gulp-sourcemaps');
var autoprefixer = require('gulp-autoprefixer');

var jsFiles = [
    'bower_components/jquery/dist/jquery.min.js',
    'bower_components/bootstrap/dist/js/bootstrap.min.js',
    'bower_components/socket.io-client/socket.io.js',
    'bower_components/sjcl/sjcl.js',
    'bower_components/cryptojslib/components/core.js',
    'bower_components/cryptojslib/components/hmac.js',
    'bower_components/cryptojslib/components/md5.js',
    'bower_components/cryptojslib/components/sha1.js',
    'bower_components/cryptojslib/components/sha256.js',
    'bower_components/cryptojslib/rollups/aes.js',
    'bower_components/cryptojslib/rollups/sha512.js',
    'bower_components/cryptojslib/components/enc-base64.js',
    'bower_components/cryptojslib/components/enc-base64.js',
    'bower_components/react/react-with-addons.js',
    'bower_components/react/react-dom.js',
    'bower_components/marked/marked.min.js',
    'src/client/js/node-bundle.js',
    'src/client/js/Utils.js',
    'src/client/js/ConnectionHelper.js',
    'src/client/js/CryptoHelper.js',
    'src/client/js/Client.js'
];

var cssFiles = [
    'bower_components/flexboxgrid/css/flexboxgrid.css',
    'bower_components/font-awesome/css/font-awesome.min.css',
    'src/client/css/style.css'
];

// js
gulp.task('js', function () {
    gulp.src(jsFiles)
        .pipe(sourcemaps.init())
        .on('error', swallowError)
        .pipe(concat('main.js'))
        .on('error', swallowError)
        .pipe(sourcemaps.write('./'))
        .on('error', swallowError)
        .pipe(gulp.dest('app/dist'));
});

// css
gulp.task('css', function () {
    gulp.src(cssFiles)
        .pipe(sourcemaps.init())
        .on('error', swallowError)
        .pipe(concat('style.css'))
        .pipe(autoprefixer('last 2 version', 'safari 5', 'ie 8', 'ie 9'))
        .on('error', swallowError)
        .pipe(gulp.dest('app/dist'))
});

gulp.task('watch', ['default'], function () {
    gulp.watch(jsFiles, ['js']);
    gulp.watch(cssFiles, ['css']);
});

gulp.task('default', ['js', 'css']);

function swallowError(error) {
    console.log(error.toString());
    this.emit('end');
}