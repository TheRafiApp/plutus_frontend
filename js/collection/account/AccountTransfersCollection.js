/**
 * AccountTransfersCollection.js
 */

define([
  'app',
  'model/account/TransferModel',
],
function(app, TransferModel) {

  return Backbone.Collection.extend({

    model: TransferModel,

    url: function() {
      return app.API() + 'account/transfers';
    }
    
  });

});