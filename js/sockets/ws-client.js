/* jshint esversion: 6, node: true */
'use strict';

const socket = require('engine.io-client');
let Socket;

module.exports = class SocketClient {
  constructor(url) {
    Socket = socket(url);
    Socket.on('open', function(){
      console.log('Opened socket: ' + url);

      Socket.on('message', function(data){
        console.log(data);
      });

      Socket.on('close', function(){
        console.log('Socket closed: ' + url);
        setTimeout(function() {
          process.exit();
        }, 500);
      });
    });
  }

  send(data, options, callback) {
    console.log('Sending data: ', data);
    return Socket.send(JSON.stringify(data), options, callback);
  }
  
  // use above to remove code dupe
  sendAndClose(data, options, callback) {
    return this.send(data, options, function() {
      if (callback) callback();
      Socket.close();
    });
  }
};