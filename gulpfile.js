var gulp = require('gulp'),
    sass = require('gulp-sass'),
    uglify = require('gulp-uglify'),
    concat = require('gulp-concat'),
    ngAnnotate = require('gulp-ng-annotate'),
    shell = require('gulp-shell'),
    args = require('yargs').argv;

var js_files = [
    "./bower_components/jquery/dist/jquery.js",
    "./bower_components/bootstrap-sass-official/assets/javascripts/bootstrap.js",
    "./bower_components/angular/angular.js",
    "./bower_components/angular-route/angular-route.js",
    //"./bower_components/angular-animate/angular-animate.js",
    "./bower_components/angular-resource/angular-resource.js",
    "./bower_components/angular-bootstrap/ui-bootstrap-tpls.js",
    "ng-tags-input_mod.js",
    "./app/js/**/*.js"
];

var css_files = [
    "app/scss/app.scss",
    "./bower_components/ng-tags-input/ng-tags-input.min.css",
    "./bower_components/ng-tags-input/ng-tags-input.bootstrap.min.css"
];

// pass --name NAME to set another appname
var appname = args.name || 'Overdressed';

gulp.task('styles', function() {
    // todo: style: compressed
    return gulp.src(css_files)
        .pipe(concat('app.css'))
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
    gulp.watch('app/scss/**/*', ['styles']);
    gulp.watch(js_files, ['scripts']);
});

// deploy the application with the install script
// pass --name NAME as argument to set name to deployed application
gulp.task('deploy', function() {
    gulp.start('deploy-do');
});

// helper to actually run the script
// (could not get the task to run as it should in the deploy-task)
gulp.task('deploy-do', shell.task([
    './server-install.sh '+appname
]));

// this task will watch for changes in the app-directory and automatically try to deploy it
// pass --name NAME as argument to set name to deployed application
// eg: $ gulp watch-deploy --name SomeAppName
gulp.task('watch-deploy', function() {
    gulp.watch([
            'app/scss/**/*.scss',
            'app/js/**/*.js',
            //'public/index.html', // cannot watch this, deploy script modifies it
            //'public/manifest.webapp', // cannot watch this, deploy script modifies it
            'public/views/**/*.html'
        ], ['deploy']);
});

gulp.task('default', function() {
    gulp.start('styles', 'scripts', 'fonts');
});
