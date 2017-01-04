/**
 * LandlordModel.js
 */

define([
	'app',
  'model/users/UserModel'
],
function(app, UserModel) {

	var LandlordModel = UserModel.extend({

		name: 'landlord',

    urlRoot: function() {
			var action = '';
			if (this.options.action) action = this.options.action;
      return app.API() + 'landlords/' + action;
    }

	});

	return LandlordModel; 

});