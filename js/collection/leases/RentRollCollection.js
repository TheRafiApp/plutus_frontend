/**
 * RentRollCollection.js
 */

define([
  'app',
  'model/leases/RentRollModel'
],
function(app, RentRollModel) {

  return app.Collection.extend({

    model: RentRollModel,

    url: function() {
			return app.API() + 'rentroll/';
    }
    
  });

});