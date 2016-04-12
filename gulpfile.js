// Defining base pathes
var basePaths = {
    bower: './bower_components/'
};

// Defining requirements
var gulp = require('gulp');
var plumber = require('gulp-plumber');
var sass = require('gulp-sass');
var watch = require('gulp-watch');
var minifyCSS = require('gulp-minify-css');
var rename = require('gulp-rename');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var merge2 = require('merge2');
var ignore = require('gulp-ignore');
var rimraf = require('gulp-rimraf');


// Run: 
// gulp sass
// Compiles SCSS files in CSS
gulp.task('sass', function () {
    gulp.src('./sass/*.scss')
        .pipe(plumber())
        .pipe(sass())
        .pipe(gulp.dest('./css'));
});


// Run: 
// gulp watch
// Starts watcher. Watcher runs gulp sass task on changes
gulp.task('watch', function () {
    gulp.watch('./sass/**/*.scss', ['sass']);
    gulp.watch('./css/theme.css', ['minifycss']);
});


// Run: 
// gulp minifycss
// Minifies CSS files
gulp.task('minifycss', ['cleancss'], function(){
  return gulp.src('./css/*.css')
    .pipe(plumber())
    .pipe(rename({suffix: '.min'}))
    .pipe(minifyCSS({keepBreaks:false}))
    .pipe(gulp.dest('./css/'));
}); 
gulp.task('cleancss', function() {
  return gulp.src('./css/*.min.css', { read: false }) // much faster 
    .pipe(ignore('theme.css'))
    .pipe(rimraf());
});


// Run: 
// gulp copy-assets. 
// Copy all needed dependency assets files from bower_component assets to themes /js, /scss and /fonts folder. Run this task after bower install or bower update

// Copy all Bootstrap JS files 
gulp.task('copy-assets', function() {
    gulp.src(basePaths.bower + 'bootstrap-sass/assets/javascripts/**/*.js')
       .pipe(gulp.dest('./js'));

// Copy all Bootstrap SCSS files
    gulp.src(basePaths.bower + 'bootstrap-sass/assets/stylesheets/**/*.scss')
       .pipe(gulp.dest('./sass/bootstrap-sass'));

// Copy all Bootstrap Fonts
    gulp.src(basePaths.bower + 'bootstrap-sass/assets/fonts/bootstrap/*.{ttf,woff,woff2,eof,svg}')
        .pipe(gulp.dest('./fonts'));

// Copy all Font Awesome Fonts
    gulp.src(basePaths.bower + 'fontawesome/fonts/**/*.{ttf,woff,woff2,eof,svg}')
        .pipe(gulp.dest('./fonts'));

// Copy all Font Awesome SCSS files
    gulp.src(basePaths.bower + 'fontawesome/scss/*.scss')
        .pipe(gulp.dest('./sass/fontawesome'));

// Copy jQuery
    gulp.src(basePaths.bower + 'jquery/dist/*.js')
        .pipe(gulp.dest('./js'));

// Copy owl carousel
    gulp.src(basePaths.bower + 'OwlCarousel2/dist/*.js')
        .pipe(gulp.dest('./js'));
    gulp.src(basePaths.bower + 'OwlCarousel2/dist/assets/*.css')
        .pipe(gulp.dest('./css'));

// _s JS files
    gulp.src(basePaths.bower + '_s/js/*.js')
        .pipe(gulp.dest('./js'));
});