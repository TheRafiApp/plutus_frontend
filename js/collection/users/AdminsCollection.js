/**
 * AdminsCollection.js
 */

define([
  'app',
  'model/users/AdminModel'
],
function(app, AdminModel) {

  return app.Collection.extend({

    model: AdminModel,

    url: function() {
      return app.API() + 'admins/';
    }
    
  });

});