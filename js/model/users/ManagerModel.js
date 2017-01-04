/**
 * ManagerModel.js
 */

define([
  'app',
  'model/users/UserModel'
],
function(app, UserModel) {

  var ManagerModel = UserModel.extend({

    name: 'manager',

    urlRoot: function() {
      var action = '';
      if (this.options.action) action = this.options.action;
      return app.API() + 'managers/' + action;
    }

  });

  return ManagerModel; 

});