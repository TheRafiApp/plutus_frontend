/**
 * TenantsCollection.js
 */

define([
  'app',
  'model/users/TenantModel'
],
function(app, TenantModel) {

  return app.Collection.extend({

    model: TenantModel,

    url: function() {
    	var action = !this.options.action ? '' : this.options.action;
			return app.API() + 'tenants/' + action;
    }

  });

});