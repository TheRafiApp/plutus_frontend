/**
 * AccountModel.js
 */

define([
  'app',
  'model/users/UserModel',
],
function(app, UserModel) {

  var AccountModel = UserModel.extend({

    name: 'account',

    initialize: function(attributes, options) {
      if (!options) options = {};
      if (!this.options) this.options = {};

      _.extend(this.options, options);

      if (!this.options.action) this.options.action = '';
    },

    url: function() {
      return app.API() + 'account/' + this.options.action;
    }

  });

  return AccountModel; 

});