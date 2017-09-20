var gulp = require('gulp');
var sass = require('gulp-sass');
var minify = require('gulp-minify');
// var babel = require('gulp-babel');
// var concat = require('gulp-concat');
// var bundle = require('gulp-bundle-assets');
var glob = require('glob');
var babelify = require('babelify');
var browserify = require('browserify');
var source = require('vinyl-source-stream');

gulp.task('sass', function () {
  gulp.src('./src/sass/**/*.scss')
    .pipe(sass({ includePaths : ['src/sass/'] , outputStyle: 'compressed'}).on('error', sass.logError))
    .pipe(minify({
        ext:{
            src:'-debug.js',
            min:'.js'
        },
        exclude: ['tasks'],
        ignoreFiles: ['.combo.js', '-min.js']
    }))
    .pipe(gulp.dest('./src/static/dist/css'));
});

gulp.task('sass:watch', function () {
  gulp.watch('./src/sass/**/*.scss', ['sass']);
});


gulp.task('react:watch', function () {
  gulp.watch('./src/js/**/*.js', ['babelify']);
});

gulp.task('babelify', function () {
  glob('./src/js/**/*.js', function(err, files) {
    if(err) done(err);

    var tasks = files.map(function(entry) {
      browserify({
        entries: entry,
        extensions: [ '.js', '.jsx' ],
        debug: true // Add sourcemaps
      })
      .transform(babelify.configure({
        presets: ["es2015", "react"]
      })) // JSX and ES6 => JS
      .bundle() // Browserify bundles required files
        .on('error', console.error.bind(console))
      .pipe(source(entry.replace(/^.*[\\\/]/, ''))) // Desired filename of bundled files
      .pipe(gulp.dest('./src/static/dist/js/'));
      console.log(entry.replace(/^.*[\\\/]/, ''))
    })
  })
})
