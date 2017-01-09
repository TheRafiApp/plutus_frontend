// Development environment

define([
  'app'
],
function(app) {
  var environment_config = {
    // Client URL
    base_url: 'http://plutus.dev',
    base_path: '/',

    // API URL
    API: 'http://10.1.10.38:8888/',
    // API: 'https://api.staging.payment.rafiproperties.com/',
    
    // Google Places
    google_places_key: 'AIzaSyDMZ-Plbcs3BMc0QkmX-7kHFeqQypaKEMA',

    // Dwolla
    dwolla_env: 'sandbox',
    
    // Bugherd
    bugherd: false,
    bugherd_key: 'iu4t9xs1xpvpinhndnrpaa',

    // Sentry
    sentry: false,
    // sentry_dsn: 'https://f99ae8cc4704427cb75dcdadb1951dc4@sentry.io/91967',
    
    // Debug
    debug: true,
    console: true, 
    bug_reporting: false
  };

  return environment_config;
});