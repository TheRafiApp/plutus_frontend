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
    
    // Sockets Server URL
    sockets_url: 'ws://localhost:4200',

    // Dwolla
    dwolla_env: 'sandbox',

    // Google Places
    google_places_key: 'AIzaSyDMZ-Plbcs3BMc0QkmX-7kHFeqQypaKEMA',
    
    // Bugherd
    bugherd: false,

    // Sentry
    sentry: false,
    
    // Debug
    debug: true,
    console: true, 
    bug_reporting: false
  };

  return environment_config;
});