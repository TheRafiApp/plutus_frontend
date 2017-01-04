/**
 * DisbursalsCollection.js
 */

define([
  'app',
  'model/properties/DisbursalModel'
],
function(app, DisbursalModel) {

  return app.Collection.extend({

    model: DisbursalModel,

    url: function() {
			return app.API() + 'disbursal/';
    }
    
  });

});