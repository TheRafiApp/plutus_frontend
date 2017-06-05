var SocketClient = require('./ws-client');

var Socket = new SocketClient('wss://app.staging.payment.rafiproperties.com:4200');

Socket.sendAndClose({
  event: 'deployment',
  refresh: true
});
