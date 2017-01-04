/**
 * LandlordsCollection.js
 */

define([
  'app',
  'model/users/LandlordModel'
],
function(app, LandlordModel) {

  return app.Collection.extend({

    model: LandlordModel,

    url: function() {
      return app.API() + 'landlords/';
    }

  });

});