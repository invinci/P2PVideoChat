module.exports = function(grunt){
  grunt.initConfig({
    jshint: {
      files: ["*.js"],
      options: {
        esnext: true,
        globals: {}
      }
    },
    less: {
      production: {
        files: {
          "public/css/style.css": ["*.less"]
        }
      }
    },
    browserify: {
      client:{
        src: ["client.js"],
        dest: "public/js/bundle.js"
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
//  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-browserify');
  grunt.registerTask('js',['browserify']);
  grunt.registerTask('default', ['jshint','js']);
};
