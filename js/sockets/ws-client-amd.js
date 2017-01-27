define([
  'underscore',
  'vendor/engine.io-client'
],
function(_, socket) {

  var Socket;

  var SocketClient = function(url) {
    Socket = socket(url);

    Socket.on('open', function(){
      console.log('Opened socket: ' + url);
    });
  };

  _.extend(SocketClient.prototype, {
    send: function(data, options, callback) {
      return Socket.send(JSON.stringify(data), options, callback);
    },
    on: function(event, callback) {
      Socket.on(event, callback);
    }
  });

  return SocketClient;

});
