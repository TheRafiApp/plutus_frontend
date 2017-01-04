/**
 * MyLeaseModel.js
 */

define([
  'app',
  'model/leases/LeaseModel'
],
function(app, LeaseModel) {

  var MyLeaseModel = LeaseModel.extend({

    urlRoot: function() {
      var at = app.utils.stash.getItem('activation'); 
      var path = at ? 'tenants/activate' : 'account';

      return app.API() + path + '/leases/';
    },
    
  });

  return MyLeaseModel;

});