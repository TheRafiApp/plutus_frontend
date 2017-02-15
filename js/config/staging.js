// Staging environment

define([
  'app'
],
function(app) {
  var environment_config = {
    // Client URL
    base_url: 'https://app.staging.payment.rafiproperties.com',
    base_path: '/',

    // API URL
    API: 'https://api.staging.payment.rafiproperties.com/',

    // Sockets Server URL
    sockets_url: 'wss://staging.payment.rafiproperties.com:4200',

    // Dwolla
    dwolla_env: 'sandbox',

    // Google Places
    google_places_key: 'AIzaSyBEhE2OH8nZyS4eBTe9oTJmPXEoWtQAzbg',
    
  	// Bugherd
    bugherd: true,
    bugherd_key: 'iu4t9xs1xpvpinhndnrpaa',

  	// Sentry
  	sentry: true,
    sentry_dsn: 'https://f99ae8cc4704427cb75dcdadb1951dc4@sentry.io/91967',

    // Debug
    debug: false,
    console: true, 
    bug_reporting: true
  };

  return environment_config;
});