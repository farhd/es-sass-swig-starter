var gulp = require('gulp')
var plumber = require('gulp-plumber')
var source = require('vinyl-source-stream')
var buffer = require('vinyl-buffer')
var swig = require('gulp-swig')
var sass = require('gulp-sass')
var sourcemaps = require('gulp-sourcemaps')
var postcss = require('gulp-postcss')
var autoprefixer = require('autoprefixer')
var browserify = require('browserify')
var babelify = require('babelify')
var cleanCss = require('gulp-cleancss')
var uglify = require('gulp-uglify')
var imagemin = require('gulp-imagemin')
var minifyJpeg = require('imagemin-jpeg-recompress')

//
var paths = {

}

// prepare Error handling
var _gulpsrc = gulp.src
gulp.src = function() {
  return _gulpsrc.apply(gulp, arguments)
    .pipe(plumber())
}

// configs
var postcssProcessors = [
  autoprefixer({
    browsers: ['last 2 versions']
  })
]
var browserifyConf = {
  entries: './src/scripts/app.js',
  debug: true
}
var babelConf = { 
  presets: ['es2015'] 
}

// Templates
gulp.task('tpls', function() {
  return gulp.src('./src/views/index.html')
    .pipe(swig())
    .pipe(gulp.dest('./dist/'))
})

// Styles
gulp.task('styles', function() {
  return gulp.src('./src/styles/app.scss')
    .pipe(sourcemaps.init())
    .pipe(sass().on('error', sass.logError))
    .pipe(postcss(postcssProcessors))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('./dist/'))
})

// Scripts
gulp.task('scripts', function() {
  return browserify(browserifyConf)
    .transform(babelify, babelConf)
    .bundle()
    .pipe(source('app.js'))
    .pipe(gulp.dest('./dist/'))
})

gulp.task('minify-css', function() {
  return gulp.src('./dist/app.css')
    .pipe(cleanCss())
    .pipe(gulp.dest('./dist/'))
})
gulp.task('minify-js', function() {
  return gulp.src('./dist/app.js')
    .pipe(buffer())
    .pipe(uglify())
    .pipe(gulp.dest('./dist/'))
})
gulp.task('minify', [
  'minify-css',
  'minify-js'
])

gulp.task('images', function() {
  return gulp.src('./src/img/*')
    .pipe(imagemin({
      optimizationLevel: 3,
      interlaced: true,
      use: [minifyJpeg({
        accurate: true,
        quality: 'medium',
        max: 70,
        min: 40,
        target: 0.60
      })]
    }))
    .pipe(gulp.dest('./dist/img/'))
})

gulp.task('build', [
  'tpls', 
  'styles', 
  'scripts'
])
gulp.task('build-min', ['build'], function() {
  gulp.start('minify') 
  gulp.start('images') 
})

gulp.task('default', function() {
  gulp.start('build')
})

gulp.task('watch', function() {
  gulp.watch('./src/**/*.html', ['tpls'])
  gulp.watch('./src/**/*.scss', ['styles'])
  gulp.watch('./src/**/*.js', ['scripts'])
})

gulp.task('default', ['watch'])