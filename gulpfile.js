var gulp = require('gulp');
var concat = require('gulp-concat');
var rename = require('gulp-rename');
var uglify = require('gulp-uglify');
var sourcemaps = require('gulp-sourcemaps');
var minifyCSS = require('gulp-minify-css');
var autoprefixer = require('gulp-autoprefixer');

var package_sources = [
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
    'js/node-bundle.js',
];
var sources = [
    'js/utils.js',
    'js/crypto_helpers.js',
    'js/session_helper.js',
    'js/file_upload_test.js',
    'js/client.js'
];
var cssFiles = [
    'bower_components/bootstrap/dist/css/bootstrap.min.css',
    'bower_components/font-awesome/css/font-awesome.min.css',
    'css/style.css'
];

// custom js files
gulp.task('js', function () {
    return gulp.src(sources)
        .pipe(sourcemaps.init())
        .pipe(concat('main.js'))
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest('public/dist'));
});
gulp.task('js-min', function () {
    return gulp.src(sources)
        .pipe(sourcemaps.init())
        .pipe(concat('main.js'))
        .pipe(uglify())
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest('public/dist'));
});

// css
gulp.task('css', function () {
    gulp.src(cssFiles)
        .pipe(concat('style.css'))
        .pipe(autoprefixer('last 2 version', 'safari 5', 'ie 8', 'ie 9'))
        .pipe(gulp.dest('public/dist'))
});
gulp.task('css-min', function () {
    gulp.src(cssFiles)
        .pipe(concat('style.css'))
        .pipe(autoprefixer('last 2 version', 'safari 5', 'ie 8', 'ie 9'))
        .pipe(minifyCSS())
        .pipe(gulp.dest('public/dist'))
});

// bower/npm package stuff
gulp.task('jspackage', function () {
    return gulp.src(package_sources)
        .pipe(sourcemaps.init())
        .pipe(concat('package.js'))
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest('public/dist'));
});
gulp.task('jspackage-min', function () {
    return gulp.src(package_sources)
        .pipe(sourcemaps.init())
        .pipe(concat('package.js'))
        .pipe(uglify())
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest('public/dist'));
});


gulp.task('watch', function () {
    gulp.watch(sources, ['js-min']);
    gulp.watch(package_sources, ['jspackage-min']);
    gulp.watch(cssFiles, ['css-min']);
});
gulp.task('watch-dev', function () {
    gulp.watch(sources, ['js']);
    gulp.watch(package_sources, ['jspackage']);
    gulp.watch(cssFiles, ['css']);
});

gulp.task('default', ['js', 'jspackage', 'css']);
gulp.task('min', ['js-min', 'jspackage-min', 'css-min'])