/**
 * TenantModel.js
 */

define([
	'app',
  'model/users/UserModel'
],
function(app, UserModel) {

	var TenantModel = UserModel.extend({

		name: 'tenant',

    urlRoot: function() {
			var action = '';
			if (this.options.action) action = this.options.action;
      return app.API() + 'tenants/' + action;
    }

	});

	return TenantModel; 

});