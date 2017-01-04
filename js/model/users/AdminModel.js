/**
 * AdminModel.js
 */

define([
  'app',
  'model/users/UserModel'
],
function(app, UserModel) {

  var AdminModel = UserModel.extend({

    name: 'admin',

    urlRoot: function() {
			var action = '';
			if (this.options.action) action = this.options.action;
      return app.API() + 'admins/' + action;
    }

  });

  return AdminModel; 

});