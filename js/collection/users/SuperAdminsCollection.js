/**
 * SuperAdminsCollection.js
 */

define([
  'app',
  'model/users/SuperAdminModel'
],
function(app, SuperAdminModel) {

  return app.Collection.extend({

    model: SuperAdminModel,

    url: function() {
      return app.API() + 'superadmins/';
    }
    
  });

});