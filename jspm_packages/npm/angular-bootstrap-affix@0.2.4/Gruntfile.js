/* */ 
'use strict';
module.exports = function(grunt) {
  var yoConfig = {
    livereload: 35729,
    src: 'src',
    dist: 'dist'
  };
  var lrSnippet = require("connect-livereload")({port: yoConfig.livereload});
  var mountFolder = function(connect, dir) {
    return connect.static(require("path").resolve(dir));
  };
  require("matchdep").filterDev('grunt-*').forEach(grunt.loadNpmTasks);
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    yo: yoConfig,
    meta: {banner: '/**\n' + ' * <%= pkg.name %>\n' + ' * @version v<%= pkg.version %> - <%= grunt.template.today("yyyy-mm-dd") %>\n' + ' * @link <%= pkg.homepage %>\n' + ' * @author <%= pkg.author.name %> <<%= pkg.author.email %>>\n' + ' * @license MIT License, http://www.opensource.org/licenses/MIT\n' + ' */\n'},
    open: {server: {path: 'http://localhost:<%= connect.options.port %>'}},
    clean: {
      dist: {files: [{
          dot: true,
          src: ['.tmp', '<%= yo.dist %>/*', '!<%= yo.dist %>/.git*']
        }]},
      server: '.tmp'
    },
    watch: {
      gruntfile: {
        files: '<%= jshint.gruntfile.src %>',
        tasks: ['jshint:gruntfile']
      },
      less: {
        files: ['<%= yo.src %>/{,*/}*.less'],
        tasks: ['less:dist']
      },
      app: {
        files: ['<%= yo.src %>/{,*/}*.html', '{.tmp,<%= yo.src %>}/{,*/}*.css', '{.tmp,<%= yo.src %>}/{,*/}*.js'],
        options: {livereload: yoConfig.livereload}
      },
      test: {
        files: '<%= jshint.test.src %>',
        tasks: ['jshint:test', 'qunit']
      }
    },
    connect: {
      options: {
        port: 9000,
        hostname: '0.0.0.0'
      },
      livereload: {options: {middleware: function(connect) {
            return [lrSnippet, mountFolder(connect, '.tmp'), mountFolder(connect, yoConfig.src)];
          }}}
    },
    less: {
      options: {paths: ['<%= yo.src %>']},
      dist: {files: {'<%= yo.src %>/<%= yo.name %>.css': '<%= yo.src %>/<%= yo.name %>.less'}}
    },
    jshint: {
      gruntfile: {
        options: {jshintrc: '.jshintrc'},
        src: 'Gruntfile.js'
      },
      src: {
        options: {jshintrc: '.jshintrc'},
        src: ['<%= yo.src %>/*.js']
      },
      test: {
        options: {jshintrc: 'test/.jshintrc'},
        src: ['test/**/*.js']
      }
    },
    karma: {
      options: {
        configFile: 'karma.conf.js',
        browsers: ['PhantomJS']
      },
      unit: {singleRun: true},
      server: {autoWatch: true}
    },
    ngmin: {
      options: {banner: '<%= meta.banner %>'},
      dist: {
        src: ['<%= yo.src %>/*.js'],
        dest: '<%= yo.dist %>/<%= pkg.name %>.js'
      }
    },
    concat: {
      options: {
        banner: '<%= meta.banner %>',
        stripBanners: true
      },
      dist: {
        src: ['<%= yo.src %>/<%= pkg.name %>.js'],
        dest: '<%= yo.dist %>/<%= pkg.name %>.js'
      }
    },
    uglify: {
      options: {banner: '<%= meta.banner %>'},
      dist: {
        src: '<%= concat.dist.dest %>',
        dest: '<%= yo.dist %>/<%= pkg.name %>.min.js'
      }
    },
    bump: {options: {
        files: ['package.json', 'bower.json'],
        commitMessage: 'chore(release): bump v<%= pkg.version %>',
        tagName: 'v<%= pkg.version %>',
        tagMessage: 'chore(release): bump v<%= pkg.version %>',
        commitFiles: ['-a'],
        pushTo: 'github'
      }}
  });
  grunt.registerTask('test', ['jshint', 'karma:unit']);
  grunt.registerTask('build', ['clean:dist', 'less:dist', 'ngmin:dist', 'uglify:dist']);
  grunt.registerTask('release', ['test', 'bump-only', 'dist', 'bump-commit']);
  grunt.registerTask('default', ['build']);
};
