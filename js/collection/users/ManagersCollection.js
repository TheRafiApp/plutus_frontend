/**
 * ManagersCollection.js
 */

define([
  'app',
  'model/users/ManagerModel'
],
function(app, ManagerModel) {

  return app.Collection.extend({

    model: ManagerModel,

    url: function() {
      return app.API() + 'managers/';
    }

  });

});