/**
 * BillsCollection.js
 */

define([
  'app',
  'model/bills/BillModel',
],
function(app, BillModel) {

  return app.Collection.extend({

    model: BillModel,

    url: function() {
      return app.API() + 'bills/';
    }
    
  });

});