module.exports = function(grunt)
{
    var js_files = [
        "./bower_components/bootstrap-sass-official/assets/javascripts/bootstrap.js",
        "./bower_components/angular/angular.js",
        "./bower_components/angular-route/angular-route.js",
        //"./bower_components/angular-animate/angular-animate.js",
        "./bower_components/angular-resource/angular-resource.js",
        "./app/js/**.js"
    ];
    grunt.initConfig({
        concat: {
            options: {
                separator: ";\n",
                sourceMap: true
            },
            js: {
                src: js_files,
                dest: "./public/app.js"
            }
        },
        sass: {
            dev: {
                options: {
                    style: 'expanded',
                    sourcemap: true
                },
                files: {
                    "./public/app.css": "./app/scss/app.scss"
                }
            },
            prod: {
                options: {
                    style: 'compressed'
                },
                files: {
                    "./public/app.css": "./app/scss/app.scss"
                }
            }
        },
        uglify: {
            all: {
                files: {
                    './public/app.js': './public/app.js'
                }
            }
        },
        watch: {
            js: {
                files: js_files,
                tasks: ['concat']
            },
            sass: {
                files: ["./app/assets/stylesheets/**/*.scss"],
                tasks: ["sass:dev"]
            }
        },
        ngAnnotate: {
            options: {},
            all: {
                files: {
                    './public/app.js': ['./public/app.js']
                }
            }
        },
        copy: {
            main: {
                files: [
                    {
                        expand: true,
                        cwd: './bower_components/bootstrap-sass-official/assets/fonts/',
                        src: ['**'],
                        dest: './public/fonts/'
                    }
                ]
            }
        }
    });

    // Plugin loading
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-sass');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-ng-annotate');

    // Task definition
    grunt.registerTask('default', [
        'sass:dev',
        'concat',
        'watch'
    ]);
    grunt.registerTask('prod', [
        'copy',
        'sass:prod',
        'concat',
        'ngAnnotate',
        'uglify'
    ]);

};