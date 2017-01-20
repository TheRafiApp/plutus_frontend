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
		  });
		});
  }

  send(data, options, callback) {
    return Socket.send(JSON.stringify(data), options, callback);
  }
  
  sendAndClose(data, options) {
    return Socket.send(JSON.stringify(data), options, function() { Socket.close(); });
  }
};