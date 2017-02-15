var SocketClient = require('./ws-client');

var Socket = new SocketClient('ws://localhost:4200');

Socket.sendAndClose({ 
  event: 'deployment',
  refresh: true
});