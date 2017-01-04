/**
 * TransferModel.js
 */

define([
  'app'
],
function(app) {

  var TransferModel = Backbone.Model.extend({

    name: 'transfer',

    urlRoot: function() {
    	return app.API() + 'users/transfers';
    }

  });

  return TransferModel; 

});