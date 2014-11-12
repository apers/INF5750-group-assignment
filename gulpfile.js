var gulp = require('gulp'),
    sass = require('gulp-sass'),
    uglify = require('gulp-uglify'),
    concat = require('gulp-concat'),
    ngAnnotate = require('gulp-ng-annotate');

var js_files = [
    //"./bower_components/bootstrap-sass-official/assets/javascripts/bootstrap.js",
    "./bower_components/angular/angular.js",
    "./bower_components/angular-route/angular-route.js",
    //"./bower_components/angular-animate/angular-animate.js",
    "./bower_components/angular-resource/angular-resource.js",
    "./app/js/*.js", // should be able to use ** instead of having subdirectory, but don't work (?!)
    "./app/js/messaging/*.js"
];

gulp.task('styles', function() {
    // todo: style: compressed
    return gulp.src('app/scss/app.scss')
        .pipe(sass({ style: 'expanded' }))
        .pipe(gulp.dest('public'));
});

gulp.task('scripts', function() {
    return gulp.src(js_files)
        .pipe(concat('app.js'))
        //.pipe(ngAnnotate())
        //.pipe(uglify())
        .pipe(gulp.dest('public'));
});

gulp.task('fonts', function() {
    return gulp.src('./bower_components/bootstrap-sass-official/assets/fonts/**')
        .pipe(gulp.dest('./public/fonts'));
});

gulp.task('watch', function() {
    gulp.watch('app/scss/**', ['styles']);
    gulp.watch(js_files, ['scripts']);
});

gulp.task('default', function() {
    gulp.start('styles', 'scripts', 'fonts');
});