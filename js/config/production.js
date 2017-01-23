// Production environment

define([
  'app'
],
function(app) {
  var environment_config = {
    // Client URL
    base_url: 'https://app.payment.rafiproperties.com',
    base_path: '/',

    // API URL
    API: 'https://api.payment.rafiproperties.com/',

    // Sockets Server URL
    sockets_url: 'wss://payment.rafiproperties.com:4200',

    // Dwolla
    dwolla_env: 'prod',

  	// Sentry
  	sentry: true,
    sentry_dsn: 'https://f2bcc9229ccd43ef848975ba162146e7@sentry.io/106844',

    // Debug
    debug: false,
    console: true, 
    bug_reporting: true
  };

  return environment_config;
});