/**
 * config.js
 */

require.config({

  // how long to wait before module loading times out
  waitSeconds : 60,

  // base url for modules
  baseUrl: location.origin + '/js/',

  paths: {
    'jquery':               'vendor/jquery.min',
    'jquery.mask':          'vendor/jquery.mask.min', 
    'jquery.auto-complete': 'vendor/jquery.auto-complete.min', 
    'jquery.serialize':     'vendor/jquery.serialize-object',
    'underscore':           'vendor/underscore',
    'backbone':             'vendor/backbone',
    'async':                'vendor/async',
    'text':                 'vendor/text',
    'moment':               'vendor/moment.min',
    'kalendae':             'vendor/kalendae',
    'chosen':               'vendor/chosen.jquery',
    'd3':                   'vendor/d3',
    'c3':                   'vendor/c3',
    'xlsx':                 'vendor/xlsx',
    'jszip':                'vendor/jszip',
    'ua-parser':            'vendor/ua-parser.min',

    // tests
    'jasmine':              'vendor/tests/jasmine',
    'jasmine-html':         'vendor/tests/jasmine-html',
    'jasmine-boot':         'vendor/tests/boot'
  },

  // non-AMD libraries
  shim: {
    'backbone':             { deps: ['underscore', 'jquery'], exports: 'Backbone' },
    'xlsx':                 { deps: ['jszip'], exports: 'XLSX' },

    // tests
    'jasmine-html':         { deps: ['jasmine'] },
    'jasmine-boot':         { deps: ['jasmine', 'jasmine-html'] }
  }
});

// Provide a stack trace that is actually usable
require.onError = function(error) {
  throw error;
};

// this array begins the process of loading dependencies, and the final one,
// main.js, begins building the app
// 
// this array also determines what modules are concatenated by r.js optimization

require([
  'async',
  'moment',
  'kalendae',
  'jquery',
  'jquery.mask',
  'jquery.serialize',
  'jquery.auto-complete',
  'chosen',
  'main',
]);