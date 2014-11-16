'use strict';

module.exports = function(grunt) {
  require('load-grunt-tasks')(grunt)
  require('time-grunt')(grunt)

  grunt.initConfig({


    jshint: {
      files: [
        '*.js',
        'app/**/*.js',
        'public/*.js',
        'test/**/*.js'
      ],
      options: {
        'asi': true,
        'bitwise': true,
        'curly': true,
        'eqeqeq': true,
        'immed': true,
        'indent': 2,
        'newcap': true,
        'noarg': true,
        'quotmark': 'single',
        'strict': true,
        'trailing': true,
        'undef': true,
        'unused': true,
        'browser': true,
        'laxcomma': true,
        'node': true,
        'smarttabs': true,
        'jquery': true,
        'esnext': true,
        'globals': {
          'describe': false,
          'it': false,
          'before': false,
          'after': false
        }
      }
    },

    handlebars: {
      compile: {
        options: {
          namespace: "templatesObj",
          processName: function(filePath) {
            return filePath.match(/(?:templates\/)(.*)(?:\.hbs)/)[1]
          }
        },
        files: {
          'public/templates.js': 'templates/*.hbs'
        }
      }
    },

    express: {
      dev: {
        options: {
          script: 'app.js'
        }
      }
    },

    watch: {
      js: {
        files: [
          '*.js',
          'public/**/*.js',
          'templates/*.hbs'
        ],
        tasks: [ 'handlebars:compile', 'express:dev' ]
      },
      options: {
        spawn: false
      }
    }
  })

  grunt.registerTask('default', [ 'handlebars:compile', 'express:dev', 'watch' ])

}
