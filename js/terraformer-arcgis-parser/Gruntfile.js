var fs = require('fs');

module.exports = function (grunt) {
  grunt.initConfig({
    pkg:   grunt.file.readJSON('package.json'),

    meta: {
      banner: '/*! Terraformer ArcGIS Parser - <%= pkg.version %> - <%= grunt.template.today("yyyy-mm-dd") %>\n' +
        '*   https://github.com/esri/terraformer-arcgis-parser\n' +
        '*   Copyright (c) <%= grunt.template.today("yyyy") %> Esri, Inc.\n' +
        '*   Licensed MIT */'
    },

    uglify: {
      options: {
        report: 'gzip',
        banner: '<%= meta.banner %>'
      },
      arcgis: {
        src: ["terraformer-arcgis-parser.js"],
        dest: 'terraformer-arcgis-parser.min.js'
      },
      versioned: {
        src: ["terraformer-arcgis-parser.js"],
        dest: 'versions/terraformer-arcgis-parser-<%= pkg.version %>.min.js'
      }
    },

    jasmine: {
      coverage: {
        src: [
          "terraformer-arcgis-parser.js"
        ],
        options: {
          specs: 'spec/*Spec.js',
          helpers:[
            "node_modules/terraformer/terraformer.js"
          ],
          //keepRunner: true,
          outfile: 'SpecRunner.html',
          template: require('grunt-template-jasmine-istanbul'),
          templateOptions: {
            coverage: './coverage/coverage.json',
            report: './coverage',
            thresholds: {
              lines: 80,
              statements: 80,
              branches: 75,
              functions: 80
            }
          }
        }
      }
    },

    jasmine_node: {
      options: {
        forceExit: true,
        match: '.',
        matchall: false,
        extensions: 'js',
        specNameMatcher: 'Spec',
        helperNameMatcher: 'Helpers'
      },
      all: ['spec/']
    },

    complexity: {
      generic: {
        src: [ 'terraformer-arcgis-parser.js' ],
        options: {
          jsLintXML: 'complexity.xml', // create XML JSLint-like report
          errorsOnly: false, // show only maintainability errors
          cyclomatic: 6,
          halstead: 15,
          maintainability: 65
        }
      }
    },

    s3: {
      options: {
        key: '<%= aws.key %>',
        secret: '<%= aws.secret %>',
        bucket: '<%= aws.bucket %>',
        access: 'public-read',
        headers: {
          // 1 Year cache policy (1000 * 60 * 60 * 24 * 365)
          "Cache-Control": "max-age=630720000, public",
          "Expires": new Date(Date.now() + 63072000000).toUTCString()
        }
      },
      dev: {
        upload: [
          {
            src: 'versions/terraformer-arcgis-parser-<%= pkg.version %>.min.js',
            dest: 'terraformer-arcgis-parser/<%= pkg.version %>/terraformer-arcgis-parser.min.js'
          }
        ]
      },
    }
  });

  var awsExists = fs.existsSync(process.env.HOME + '/terraformer-s3.json');

  if (awsExists) {
    grunt.config.set('aws', grunt.file.readJSON(process.env.HOME + '/terraformer-s3.json'));
  }

  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-jasmine');
  grunt.loadNpmTasks('grunt-jasmine-node');
  grunt.loadNpmTasks('grunt-complexity');
  grunt.loadNpmTasks('grunt-s3');

  grunt.registerTask('test', ['jasmine_node', 'jasmine']);
  grunt.registerTask('version', ['test', 'uglify', 's3']);
  grunt.registerTask('default', ['test']);
};