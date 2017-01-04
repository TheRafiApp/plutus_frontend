/**
 * LeasesCollection.js
 */

define([
  'app',
  'model/leases/LeaseModel'
],
function(app, LeaseModel) {

  return app.Collection.extend({

    model: LeaseModel,

    url: function() {
			return app.API() + 'leases/';
    }
    
  });

});