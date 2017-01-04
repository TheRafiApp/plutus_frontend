/**
 * MyLeasesCollection.js
 */

define([
  'app',
  'model/leases/MyLeaseModel',
],
function(app, MyLeaseModel) {

  return Backbone.Collection.extend({

    model: MyLeaseModel,

    url: function() {
      return app.API() + 'account/leases';
    }
    
  });

});