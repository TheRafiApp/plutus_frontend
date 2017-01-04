/**
 * SuperAdminModel.js
 */

define([
  'app',
  'model/users/UserModel'
],
function(app, UserModel) {

  var AdminModel = UserModel.extend({

    name: 'superadmin',

    initialize: function(attributes, options) {
      if (!options) options = {};
      if (!this.options) this.options = {};

      this.options = _.extend(this.options, options);
      if (!this.options.role) this.options.role = 'users';

      // event listeners for computed fields
      this.on('change:phone_pretty', this.updatePhone, this);

      _.extend(this.validation, this.additionalValidation);
    },

    urlRoot: function() {
			var action = '';
			if (this.options.action) action = this.options.action;
      return app.API() + 'superadmins/' + action;
    },

    additionalValidation: {
      password: function(input, field, attributes) {
        if (!input && this.isNew()) {
          return 'Password is required';
        }

        if (!Backbone.Validation.patterns.password.test(input))
          return Backbone.Validation.messages.password;
      }
    }

  });

  return AdminModel; 

});