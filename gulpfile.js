var gulp = require('gulp');
var concat = require('gulp-concat');
var rename = require('gulp-rename');
var uglify = require('gulp-uglify');
var sourcemaps = require('gulp-sourcemaps');
var minifyCSS = require('gulp-minify-css');
var autoprefixer = require('gulp-autoprefixer');
var babel = require("gulp-babel");

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
    'js/libs/node-bundle.js',
    'js/libs/forge.min.js',
    'js/utils.js',
    'js/crypto_helpers.js',
    'js/session_helper.js',
    'js/file_upload_test.js',
    'js/client.js'
];

var reactFiles = 'js/jsx/**/*.jsx';

var cssFiles = [
    'bower_components/bootstrap/dist/css/bootstrap.min.css',
    'bower_components/font-awesome/css/font-awesome.min.css',
    'css/style.css'
];

// custom js files
gulp.task('js', function () {
    gulp.src(jsFiles)
        .pipe(sourcemaps.init())
        .on('error', swallowError)
        .pipe(concat('main.js'))
        .on('error', swallowError)
        .pipe(sourcemaps.write('./'))
        .on('error', swallowError)
        .pipe(gulp.dest('public/dist'));
});
gulp.task('js-min', function () {
    gulp.src(jsFiles)
        .pipe(sourcemaps.init())
        .pipe(concat('main.js'))
        .on('error', swallowError)
        .pipe(uglify())
        .on('error', swallowError)
        .pipe(sourcemaps.write('./'))
        .on('error', swallowError)
        .pipe(gulp.dest('public/dist'));
});

// custom js files
gulp.task('react-js', function () {
    return gulp.src(reactFiles)
        .pipe(sourcemaps.init())
        .on('error', swallowError)
        .pipe(babel({
            presets: ['react']
        }))
        .on('error', swallowError)
        .pipe(concat("react-main.js"))
        .on('error', swallowError)
        .pipe(sourcemaps.write("."))
        .pipe(gulp.dest("public/dist"));
});

// css
gulp.task('css', function () {
    gulp.src(cssFiles)
        .pipe(concat('style.css'))
        .pipe(autoprefixer('last 2 version', 'safari 5', 'ie 8', 'ie 9'))
        .on('error', swallowError)
        .pipe(gulp.dest('public/dist'))
});
gulp.task('css-min', function () {
    gulp.src(cssFiles)
        .pipe(concat('style.css'))
        .pipe(autoprefixer('last 2 version', 'safari 5', 'ie 8', 'ie 9'))
        .on('error', swallowError)
        .pipe(minifyCSS())
        .on('error', swallowError)
        .pipe(gulp.dest('public/dist'))
});

gulp.task('watch', function () {
    gulp.watch(jsFiles, ['js-min']);
    gulp.watch(reactFiles, ['react-js']);
    gulp.watch(cssFiles, ['css-min']);
});
gulp.task('watch-dev', function () {
    gulp.watch(jsFiles, ['js']);
    gulp.watch(reactFiles, ['react-js']);
    gulp.watch(cssFiles, ['css']);
});

gulp.task('default', ['js', 'css', 'react-js']);
gulp.task('min', ['js-min', 'css-min', 'react-js']);

function swallowError (error) {
    console.log(error.toString());
    this.emit('end');
}