
var gulp       = require('gulp'),
    del        = require('del'),
    fs         = require('fs'),
    path       = require('path'),
    debug      = require('gulp-debug'),
    shell      = require('gulp-shell'),
    gutil      = require('gulp-util'),
    sass       = require('gulp-sass'),
    replace    = require('gulp-replace'),
    nano       = require('gulp-cssnano'),
    uglify     = require('gulp-uglify'),
    concat     = require('gulp-concat'),
    rename     = require('gulp-rename'),
    rjs        = require('gulp-requirejs'),
    livereload = require('gulp-livereload'),
    sourcemaps = require('gulp-sourcemaps'),
    wait       = require('gulp-wait'),
    merge      = require('merge-stream'),
    find       = require('gulp-find'),
    clip       = require('gulp-clip-empty-files'),
    toArray    = require('stream-to-array')
    argv       = require('yargs').argv

// css /////////////////////////////////////////////////////////////////////////

// delete
gulp.task('css-del', function() {
  return del([
    './css/build/*.*',
    '!./css/vendor/*'
  ]);
});

// compile & concat scss
gulp.task('css-scss', function() {
  return gulp.src([
      'scss/vendor/*',
      'scss/style.scss',
      'js/templates/**/*.scss'
    ])
    // .pipe(debug())
    .pipe(sourcemaps.init())
    
    .pipe(sass({
      outputStyle: 'expanded',
      includePaths: require('node-bourbon').includePaths
    }))
    // hack to fix sourcemaps bug with sass/autoprefixer
    .pipe(sourcemaps.write({includeContent: false}))
    .pipe(sourcemaps.init({loadMaps: true}))

    .pipe(nano({
      core: false,
      zindex: false,
      autoprefixer: { browsers: ['last 8 versions'], add: true }
    }))
    
    .pipe(concat('styles.css'))
    .pipe(sourcemaps.write('/', {
      sourceRoot: function(file) {
        // gutil.log(path.dirname(file.path));
        return path.dirname(file.path);
      }
    }))
    .pipe(gulp.dest('./css/'))
    .pipe(livereload());
});

gulp.task('css-dwolla', function() {
  return gulp.src([
      'scss/dwolla_style.scss',
    ])
    // .pipe(debug())
    .pipe(sourcemaps.init())
    
    .pipe(sass({
      outputStyle: 'expanded',
      includePaths: require('node-bourbon').includePaths
    }))
    // hack to fix sourcemaps bug with sass/autoprefixer
    .pipe(sourcemaps.write({includeContent: false}))
    .pipe(sourcemaps.init({loadMaps: true}))

    .pipe(nano({
      core: false,
      zindex: false,
      autoprefixer: { browsers: ['last 8 versions'], add: true }
    }))
    
    .pipe(sourcemaps.write('/', {
      sourceRoot: function(file) {
        // gutil.log(path.dirname(file.path));
        return path.dirname(file.path);
      }
    }))
    .pipe(rename('dwolla_style.css'))
    .pipe(gulp.dest('./css/'))
    .pipe(livereload());
})

// gulp.task('css-concat', ['css-scss'], function() {
//   return gulp.src([
//     './css/*.css',
//     './css/vendor/*.css'
//     ])
//     .pipe(concat('styles.css'))
//     .pipe(gulp.dest('./css'));
// });

// minify
gulp.task('css-minify', ['css-scss'], function() {
  return gulp.src('./css/build/styles.css')
    .pipe(sourcemaps.init({ loadMaps: true }))
    .pipe(nano({
      zindex: false
    }))
    .pipe(rename({ extname: '.min.css' }))
    .pipe(sourcemaps.write('/'))
    .pipe(gulp.dest('./css/build/'));
});

// watch
gulp.task('css-watch', function() {
  livereload.listen();
  return gulp.watch('./**/*.scss', ['css']);
});

// tasks
gulp.task('css-dev', ['css-concat']);
gulp.task('css', ['css-minify']);

// js //////////////////////////////////////////////////////////////////////////

// names of directories to bring into /build
// vendor will be included but i only need 3 modules to be included there
var directories = [
  'collection',
  'model',
  'view',
  'templates'
];

// check for unescaped output in templates
gulp.task('js-xss-check', function() {
  var stream = gulp.src('./js/templates/**/*.html')
    .pipe(find(/(?!{).{{ (?!\/\* ok)/g)) // to use unescaped output, i have to sign it with /* ok */
    .pipe(clip())

  var array = toArray(stream, function(err, arr) {
    if (arr.length > 0) {
      var files = [];
      for (item in arr) {
        files.push(arr[item].path)
      }

      var er = new gutil.PluginError({
        plugin: 'none',
        message: gutil.colors.red('Found potential XSS vulnerabilities in files: ') + gutil.colors.green(files.join(', \n'))
      });

      throw er;
    }
  });

  return stream;
})

// clean - remove old build files
gulp.task('js-clean', ['js-xss-check'], function() {
  return del([
    './js/temp/**',
    './js/build/**',
    './js/config.build.js',
    './js/app.build.js',
    './js/app.build.js.map'
  ]);
});

gulp.task('js-backup-config', function() {
  if (argv.staging || argv.production) {
    gulp.src('./js/env-config.js')
      .pipe(rename('env-config.js.temp'))
      .pipe(gulp.dest('./js/'));
  } else {
    return gulp.src('').pipe(gulp.dest(''));
  }
})

// 
gulp.task('js-check-args', ['js-backup-config'], function() {
  var config;

  if (!(argv.staging || argv.production)) return gulp.src('').pipe(gulp.dest(''));

  if (argv.staging) {
    config = 'staging';
  } else if (argv.production) {
    config = 'production';
  }

  return gulp.src('')
    .pipe(shell([
      'npm run ' + config
    ]));
});

// increment rev
gulp.task('js-version', ['js-clean', 'js-check-args'], shell.task([
  'printf $(date +%s) > ./buildversion'
]));

// copy - create new build directory
gulp.task('js-copy', ['js-version'], function() {

  var tasks = directories.map(function(directory) {
    var currentPath = './js/' + directory + '/**/*';
    return gulp.src(currentPath)
      .pipe(gulp.dest('./js/temp/' + directory));
  });

  tasks.push(
    gulp.src([
      './js/vendor/require.js',
      './js/vendor/xlsx.js',
      './js/vendor/jszip.js',
      './js/vendor/d3.js',
      './js/vendor/nouislider.js'
    ])
    .pipe(gulp.dest('./js/temp/vendor'))
  );

  return merge(tasks);
});

// update config baseUrl
gulp.task('js-config', ['js-copy'], function() {
  var version = fs.readFileSync('./buildversion', 'utf8');

  return gulp.src('./js/config.js')
    .pipe(replace("location.origin + '/js/'", "location.origin + '/js/build/" + version + "/'"))
    .pipe(rename({ extname: '.build.js' }))
    .pipe(gulp.dest('./js/'));
});

// run r.js optimizer
// 
// yes, the gulp-requirejs plugin is blacklisted for being anti-pattern, but it
// handles our module dependencies correctly, while amd-optimize does not.
gulp.task('js-rjs', ['js-config'], function() {
  
  rjs({
    baseUrl: './js',

    paths: {
      'jquery':                'vendor/jquery.min',
      'jquery.mask':           'vendor/jquery.mask.min', 
      'jquery.auto-complete':  'vendor/jquery.auto-complete.min', 
      'jquery.serialize':      'vendor/jquery.serialize-object',
      'underscore':            'vendor/underscore',
      'backbone':              'vendor/backbone',
      'async':                 'vendor/async',
      'text':                  'vendor/text',
      'moment':                'vendor/moment.min',
      'kalendae':              'vendor/kalendae',
      'chosen':                'vendor/chosen.jquery',

      'view/DebugView':        'empty:', // do not include debug in build
      'jasmine':               'empty:', // do not include tests in build
      'jasmine-html':          'empty:',
      'jasmine-boot':          'empty:',
      'https://cdn.ravenjs.com/3.4.1/raven.min.js': 'empty:' // no build use cdn
    },
    name: 'config.build',
    out: 'app.build.js'
  })
  .pipe(wait(3000)) // hack for gulp-requirejs not using promises correctly
  .pipe(sourcemaps.init())
  .pipe(uglify().on('error', gutil.log))
  .pipe(sourcemaps.write('/'))
  .pipe(gulp.dest('./js'));
});

// uglify all js files in build folder
gulp.task('js-uglify', ['js-rjs'], function() {
  return gulp.src('./js/temp/**/*.js')
    .pipe(sourcemaps.init())
    .pipe(uglify())
    .pipe(sourcemaps.write('/'))
    .pipe(gulp.dest('./js/temp'));
});

gulp.task('js-build-version', ['js-uglify'], function() {

  var version = fs.readFileSync('./buildversion', 'utf8');
  gutil.log('Build version: ' + version);

  return gulp.src('')
    .pipe(shell([
      'files=./js/temp/*;' +
      'mkdir -p ./js/build/' + version + ';' +
      'mv $files ./js/build/' + version + ';' +
      'rm -rf ./js/temp;' + 
      'exit 0'
    ]));
});

gulp.task('js-config-restore', ['js-build-version'], function() {
  return gulp.src('./js/env-config.js.temp')
    .pipe(rename('env-config.js'))
    .pipe(gulp.dest('./js/'))
})

gulp.task('js-config-cleanup', ['js-config-restore'], function() {
  return del(['./js/env-config.js.temp'])
})

// watch
gulp.task('js-watch', function() {
  return gulp.watch('./js/**/*.js', ['js-dev']);
});

// tasks
gulp.task('js-build', ['js-config-cleanup']);
gulp.task('js-dev', ['js-concat']);
gulp.task('js', ['js-uglify']);


// default /////////////////////////////////////////////////////////////////////

gulp.task('dev', ['css-dev']);
gulp.task('default', ['css-watch']);
